namespace AppBoxCore;

public static class Consts
{
    public const string SYS = "sys";

    // ReSharper disable once InconsistentNaming
    public static readonly int SYS_APP_ID =
        StringUtil.GetHashCode("AppBox") ^ StringUtil.GetHashCode(SYS);
}