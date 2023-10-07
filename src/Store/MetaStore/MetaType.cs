namespace AppBoxStore;

public static class MetaType
{
    //以下常量跟内置存储的MetaCF内的Key前缀一致
    public const byte Meta_Application = 0x0C;
    public const byte Meta_Model = 0x0D;
    public const byte Meta_Code = 0x0E;

    public const byte Meta_Folder = 0x0F;
    //public const byte Meta_Service_Assembly = 0xA0;
    //public const byte Meta_View_Assembly = 0xA1;
    //public const byte Meta_App_Assembly = 0xA3;

    public const byte Meta_View_Router = 0xA2;

    public const byte Meta_App_Model_Dev_Counter = 0xAC;
    public const byte Meta_App_Model_Usr_Counter = 0xAD;

    public const byte ModelType_Application = 100;
    public const byte ModelType_Folder = 101;
}