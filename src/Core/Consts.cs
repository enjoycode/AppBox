namespace AppBoxCore;

public static class Consts
{
    public const string SYS = "sys";

    public static readonly int SYS_APP_ID =
        StringUtil.GetHashCode("AppBox") ^ StringUtil.GetHashCode(SYS);
}