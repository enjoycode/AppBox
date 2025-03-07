namespace AppBoxCore
{
    public enum PayloadType : byte
    {
        Null = 0,

        //====常规类型====
        BooleanTrue = 1,
        BooleanFalse = 2,
        Byte = 3,
        Char = 4,
        Decimal = 5,
        Float = 6,
        Double = 7,
        Int16 = 8,
        Int32 = 9,
        Int64 = 10,
        DateTime = 15,
        String = 16,
        Guid = 17,

        //====Collection====
        Map = 18,
        Array = 19,
        List = 20,

        /** 扩展类型 */
        ExtKnownType = 21,

        /** 对象引用 */
        ObjectRef = 22,

        /** 未知类型 */
        JsonResult = 23,

        /** 其他未知类型 */
        Object = 24,

        Expression = 25,

        //----设计时及模型相关----
        DataStoreModel= 50,
        ApplicationModel = 51,
        ModelFolder = 52,
        ModelBase = 53,
        EntityModel = 54,
        ServiceModel = 55,
        ViewModel = 56,
        WorkflowModel = 57,
        ReportModel = 58,
        PermissionModel = 59,
        
        OrderedField = 63,
        TextChange = 64,
        PrimaryKeyField = 65,
        
        CheckoutInfo = 66,
        CheckoutResult = 67,
        PendingChange = 68,
        PublishPackage = 69,

        //----运行时相关类型----
        Entity = 90,
        PermissionNode = 91,
        DynamicTable = 92,
    }
}