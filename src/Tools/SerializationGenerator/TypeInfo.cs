namespace SerializationGenerator
{
    public readonly struct TypeInfo
    {
        public readonly string? TypeName;
        public readonly string? WriteCastExpression; //用于枚举转换为整型值
        public readonly string? ReadCastExpression;

        public TypeInfo(string? typeName, string? writeCastExpression = null, string? readCastExpression = null)
        {
            TypeName = typeName;
            WriteCastExpression = writeCastExpression;
            ReadCastExpression = readCastExpression;
        }
    }
}