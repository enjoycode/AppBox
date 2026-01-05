using System.Diagnostics;
using System.Runtime.InteropServices;
using AppBoxCore;
using AppBoxDesign.Debugging;
using static AppBoxServer.Design.DebugLogger;

namespace AppBoxServer.Design;

/// <summary>
/// 调试进程
/// </summary>
internal sealed class DebugProcess
{
    public DebugProcess(IUserSession session, ModelId modelId)
    {
        _session = session;
        _modelId = modelId;
        _parser = new MIParser(OnDebuggerOutput, OnDebuggerResult);
    }

    private readonly ModelId _modelId;
    private readonly IUserSession _session;
    private readonly MIParser _parser;
    private Process? _process;
    private ulong _cmdIdIndex;
    private readonly Dictionary<ulong, DebugRequest> _pendingCmds = new();

    public void Start(string sessionName, string appName, string serviceName, string methodName, int[] breakpoints)
    {
        var process = new Process();
        var debuggerFile = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? Path.Combine(AppContext.BaseDirectory, "Debugger", "netcoredbg.exe")
            : Path.Combine(AppContext.BaseDirectory, "Debugger", "netcoredbg");
        var runnerFile = Path.Combine(AppContext.BaseDirectory, "ServiceRunner.dll");
        process.StartInfo.FileName = debuggerFile;
        process.StartInfo.Arguments =
            $"--interpreter=mi -- dotnet {runnerFile} {sessionName} {appName}.{serviceName}.{methodName}";
        process.StartInfo.UseShellExecute = false;
        process.StartInfo.RedirectStandardInput = true;
        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;
        process.EnableRaisingEvents = true;
        process.ErrorDataReceived += OnErrorDataReceived;
        process.Exited += OnProcessExited;

        process.Start();
        StartReadOutput(process);

        _process = process;
        //SendCommand("-gdb-set just-my-code 1");
        var serviceFileName = $"{appName}.Services.{serviceName}.cs";
        AddBreakpoints(serviceFileName, breakpoints);
        SendCommand("-exec-run");
    }

    private void StartReadOutput(Process process)
    {
        //TODO: https://learn.microsoft.com/en-us/dotnet/standard/io/pipelines
        Task.Run(async () =>
        {
            while (!process.HasExited)
            {
                var line = await process.StandardOutput.ReadLineAsync();
                // Console.WriteLine(line);
                if (!string.IsNullOrEmpty(line))
                {
                    try
                    {
                        _parser.ParseOutput(line);
                    }
                    catch (Exception e)
                    {
                        Logger.Error($"ParseOutput: {e.Message}\n {line}");
                    }
                }
            }
        });
    }

    #region ====Commands====

    private void AddBreakpoints(string fileName, int[] breakpoints)
    {
        for (var i = 0; i < breakpoints.Length; i++)
        {
            SendCommand($"-break-insert -f {fileName}:{breakpoints[i]}");
        }
    }

    private void SendCommand(string command)
    {
        _process?.StandardInput.WriteLine(command);
    }

    /// <summary>
    /// 继续中断的调试
    /// </summary>
    internal void Resume()
    {
        SendCommand("-exec-continue");
    }

    private TaskCompletionSource<DebugEventArgs> MakePendingCommand(DebugRequestType requestType, out ulong cmdId)
    {
        cmdId = Interlocked.Increment(ref _cmdIdIndex);
        var request = new DebugRequest(requestType);
        _pendingCmds[cmdId] = request;
        return request.TaskCompletionSource;
    }

    /// <summary>
    /// 计算表达式的值
    /// </summary>
    internal Task<DebugEventArgs> CreateVariable(string expression)
    {
        var taskSource = MakePendingCommand(DebugRequestType.CreateVariable, out var cmdId);
        SendCommand($"{cmdId}-var-create v{cmdId} {expression}");
        return taskSource.Task;
    }

    /// <summary>
    /// 列出变量的所有子级
    /// </summary>
    internal Task<DebugEventArgs> ListVariableChildren(string varName)
    {
        var taskSource = MakePendingCommand(DebugRequestType.ListChildren, out var cmdId);
        SendCommand($"{cmdId}-var-list-children {varName}");
        return taskSource.Task;
    }

    private Task<DebugEventArgs> EvaluateVariable(string varName)
    {
        var taskSource = MakePendingCommand(DebugRequestType.EvaluateVariable, out var cmdId);
        SendCommand($"{cmdId}-var-evaluate-expression {varName}");
        return taskSource.Task;
    }

    #endregion

    #region ====EventHandler====

    private void OnDebuggerOutput(MIOutOfBandRecord record)
    {
        Console.WriteLine($"{record.GetType().Name}: {record}");

        //判断stopped的情况
        if (record is MIAsyncRecord asyncRecord && asyncRecord.Output.Class == MIAsyncOutputClass.Stopped)
        {
            var outputResults = asyncRecord.Output.Results;
            if (outputResults.TryGetValue("reason", out var reason) && reason is MIConst value)
            {
                //如果是entry-point-hit，暂自动继续执行
                if (value.CString == "entry-point-hit")
                {
                    SendCommand("-exec-continue");
                }
                else if (value.CString == "breakpoint-hit")
                {
                    var frame = ((MITuple)outputResults["frame"]);
                    var lineNumber = ((MIConst)frame["line"]).GetInt();
                    RaiseDebugEvent(new HitBreakpoint() { LineNumber = lineNumber });
                }
                else if (value.CString == "exited")
                {
                    SendCommand("-gdb-exit");
                    RaiseDebugEvent(new DebuggerExited { ExitCode = 0 /*TODO*/ });
                }
            }
        }
    }

    private void OnDebuggerResult(MIResultRecord record)
    {
        Console.WriteLine($"{record.GetType().Name}: {record}");

        if (record.Token != null)
        {
            if (_pendingCmds.Remove(record.Token.Value.Number, out var request))
            {
                var response = request.ParseResponse(record);
                if (request.RequestType != DebugRequestType.ListChildren)
                {
                    request.TaskCompletionSource.SetResult(new DebugEventArgs(_modelId, response));
                }
                else
                {
                    //需要继续计算各个子属性的值
                    EvaluateChildrenValue(request, (VariableChildren)response);
                }
            }
        }
    }

    /// <summary>
    /// 因为ListChildren没有计算值，所以暂用此方法计算完值后再返回给前端
    /// </summary>
    private async void EvaluateChildrenValue(DebugRequest request, VariableChildren response)
    {
        try
        {
            for (var i = 0; i < response.Children.Count; i++)
            {
                var name = response.Children[i].Name;
                var result = await EvaluateVariable(name);
                var value = (EvaluateValue)result.EventArgs;
                response.Children[i].Value = value.Value;
            }
        }
        catch (Exception e)
        {
            Logger.Error($"[{_session.Name}] Debugger evaluate variable error: {e.Message}");
        }
        finally
        {
            request.TaskCompletionSource.SetResult(new DebugEventArgs(_modelId, response));
        }
    }


    private void OnErrorDataReceived(object sender, DataReceivedEventArgs e)
    {
        if (!string.IsNullOrEmpty(e.Data))
            Logger.Error($"[{_session.Name}] Debugger error: {e.Data}");
    }

    private void OnProcessExited(object? sender, EventArgs e)
    {
        DebugService.OnProcessExited(_session.Name);
        Logger.Info($"[{_session.Name}] Debugger process exited");
    }

    #endregion

    /// <summary>
    /// 激发调试事件发送给客户端处理
    /// </summary>
    private void RaiseDebugEvent(IDebugEventArgs eventArgs)
    {
        var args = new DebugEventArgs(_modelId, eventArgs);
        var remote = (IRemoteChannel)_session.Channel;
        remote.SendServerEvent(IDebugEventArgs.DebugEventId, AnyArgs.Make(args));
    }
}