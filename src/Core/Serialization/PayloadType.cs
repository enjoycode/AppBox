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
        JsonObject = 23,

        /** 其他未知类型 */
        Object = 24,

        //----设计时及模型相关----
        EntityModelVO = 51,
        DesignTree = 52,
        CompletionItem = 53,
        NewNodeResult = 54,
        ChangedModel = 55,
        CodeProblem = 56,
        FieldWithOrder = 57,
        EntityFieldVO = 58,
        EntityRefVO = 59,
        EntitySetVO = 60,

        //----运行时相关类型----
        Entity = 90,
    }
}