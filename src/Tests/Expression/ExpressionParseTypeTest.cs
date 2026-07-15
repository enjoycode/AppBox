using AppBoxCore;
using NUnit.Framework;

namespace Tests.Design;

public class ExpressionParseTypeTest : ExpressionTestBase
{
    [Test]
    public void ParseVoid() => ParseSystemType("void",
        r => r.Type == ExpressionTypeInfo.KnownType.Void);

    [Test]
    public void ParseObject() => ParseSystemType("object",
        r => r.Type == ExpressionTypeInfo.KnownType.Object);

    [Test]
    public void ParseNullableInt() => ParseSystemType("int?",
        r => r.Type == ExpressionTypeInfo.KnownType.Int32 && r.IsNullable);

    [Test]
    public void ParseGuid() => ParseSystemType("Guid",
        r => r.Type == ExpressionTypeInfo.KnownType.Guid && !r.IsNullable);

    [Test]
    public void ParseArrayOfInt() => ParseSystemType("int[]",
        r => r.Type == ExpressionTypeInfo.KnownType.Array &&
             r.Types![0].Type == ExpressionTypeInfo.KnownType.Int32);

    [Test]
    public void ParseListOfInt() => ParseSystemType("List<int>", r =>
        r.Type == ExpressionTypeInfo.KnownType.List &&
        r.Types!.Length == 1 && r.Types[0].Type == ExpressionTypeInfo.KnownType.Int32);

    [Test]
    public void ParseGenericType() => ParseSystemType("Task<int>",
        r => r.Type == ExpressionTypeInfo.KnownType.Unknown &&
             r.IsGeneric && r.Types!.Length == 1 && r.Types[0].Type == ExpressionTypeInfo.KnownType.Int32);

    [Test]
    public Task ParseAppBoxEntity() => ParseAppBoxType("sys.Entities.Employee?",
        r => r.Type == ExpressionTypeInfo.KnownType.Model && r.IsNullable);
}