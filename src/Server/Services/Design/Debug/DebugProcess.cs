using System.Diagnostics;
using System.Runtime.InteropServices;

namespace AppBoxServer.Design;

/// <summary>
/// 调试进程
/// </summary>
internal sealed class DebugProcess
{
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
        process.ErrorDataReceived += OnErrorDataReceived;
        process.Exited += OnProcessExited;

        process.Start();
        StartReadOutput(process);
        
        process.StandardInput.WriteLine("-exec-run");
    }

    private void StartReadOutput(Process process)
    {
        //TODO: use Channel for read and parse
        Task.Run(async () =>
        {
            while (!process.HasExited)
            {
                var line = await process.StandardOutput.ReadLineAsync();
                Console.WriteLine(line);
            }
        });
    }

    private static void OnErrorDataReceived(object sender, DataReceivedEventArgs e)
    {
        if (!string.IsNullOrEmpty(e.Data))
        {
            Console.WriteLine(e.Data);
        }
    }

    private static void OnProcessExited(object? sender, EventArgs e)
    {
        Console.WriteLine("Debug process exited");
    }
}