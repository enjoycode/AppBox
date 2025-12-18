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

    public void Start(string sessionName, string serviceMethod)
    {
        var process = new Process();
        var debuggerFile = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? Path.Combine(AppContext.BaseDirectory, "Debugger", "netcoredbg.exe")
            : Path.Combine(AppContext.BaseDirectory, "Debugger", "netcoredbg");
        var runnerFile = Path.Combine(AppContext.BaseDirectory, "ServiceDebugger.dll");
        process.StartInfo.FileName = debuggerFile;
        process.StartInfo.Arguments = $"--interpreter=mi -- dotnet {runnerFile} {sessionName} {serviceMethod}";
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
        SendCommand("-exec-run");
    }

    private void SendCommand(string command)
    {
        _process?.StandardInput.WriteLine(command);
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

    private void OnDebuggerOutput(MIOutOfBandRecord record)
    {
        Console.WriteLine($"{record.GetType().Name}: {record}");

        //判断stopped的情况
        if (record is MIAsyncRecord asyncRecord && asyncRecord.Output.Class == MIAsyncOutputClass.Stopped)
        {
            if (asyncRecord.Output.Results.TryGetValue("reason", out var reason) && reason is MIConst value)
            {
                //如果是entry-point-hit，暂自动继续执行
                if (value.CString == "entry-point-hit")
                {
                    SendCommand("-exec-continue");
                }
                else if (value.CString == "exited")
                {
                    SendCommand("-gdb-exit");
                    RaiseDebugEvent(new DebuggerExited(0 /*TODO:*/));
                }
            }
        }
    }

    private void OnDebuggerResult(MIResultRecord record)
    {
        Console.WriteLine($"{record.GetType().Name}: {record}");
    }

    private static void OnErrorDataReceived(object sender, DataReceivedEventArgs e)
    {
        if (!string.IsNullOrEmpty(e.Data))
            Logger.Error($"Debugger error: {e.Data}");
    }

    private static void OnProcessExited(object? sender, EventArgs e)
    {
        Logger.Info("Debugger process exited");
    }

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