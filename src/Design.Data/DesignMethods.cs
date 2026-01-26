namespace AppBoxDesign;

public static class DesignMethods
{
    private const string DesignService = "sys.DesignService";


    public const string UploadExtAssembly = "UploadExtAssembly";
    public const string UploadExtAssemblyFull = $"{DesignService}.{UploadExtAssembly}";

    public const string GetExtLibraries = "GetExtLibraries";
    public const string GetExtLibrariesFull = $"{DesignService}.{GetExtLibraries}";

    #region ====Debug Methods====

    public const string DebugUploadService = "DebugUploadService";
    public const string DebugUploadServiceFull = $"{DesignService}.{DebugUploadService}";

    public const string DebugStart = "DebugStart";
    public const string DebugStartFull = $"{DesignService}.{DebugStart}";

    public const string DebugResume = "DebugResume";
    public const string DebugResumeFull = $"{DesignService}.{DebugResume}";

    public const string DebugExit = "DebugExit";
    public const string DebugExitFull = $"{DesignService}.{DebugExit}";

    public const string DebugEvaluate = "DebugEvaluate";
    public const string DebugEvaluateFull = $"{DesignService}.{DebugEvaluate}";

    public const string DebugListChildren = "DebugListChildren";
    public const string DebugListChildrenFull = $"{DesignService}.{DebugListChildren}";

    #endregion
}