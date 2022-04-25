using System.Runtime.CompilerServices;

namespace AppBoxCore;

public static class Log
{

    public static ILogProvider Logger = new ConsoleLogProvider();

    [System.Diagnostics.Conditional("DEBUG")]
    public static void Debug(string msg, [CallerFilePath] string file = "", [CallerMemberName] string method = "", [CallerLineNumber] int line = 0)
    {
        Logger.Write(LogLevel.Debug, Path.GetFileNameWithoutExtension(file), line, method, msg);
    }

    public static void Info(string msg, [CallerFilePath] string file = "", [CallerMemberName] string method = "", [CallerLineNumber] int line = 0)
    {
        Logger.Write(LogLevel.Info, Path.GetFileNameWithoutExtension(file), line, method, msg);
    }

    public static void Warn(string msg, [CallerFilePath] string file = "", [CallerMemberName] string method = "", [CallerLineNumber] int line = 0)
    {
        Logger.Write(LogLevel.Warn, Path.GetFileNameWithoutExtension(file), line, method, msg);
    }

    public static void Error(string msg, [CallerFilePath] string file = "", [CallerMemberName] string method = "", [CallerLineNumber] int line = 0)
    {
        Logger.Write(LogLevel.Error, Path.GetFileNameWithoutExtension(file), line, method, msg);
    }

}