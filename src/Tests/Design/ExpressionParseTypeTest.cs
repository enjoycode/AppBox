using AppBoxCore;
using AppBoxDesign;
using AppBoxDesign.CodeGenerator;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using NUnit.Framework;

namespace Tests.Design;

public class ExpressionParseTypeTest
{
    [SetUp]
    public static async Task InitSetup()
    {
        await MetadataReferences.InitAsync(new MockMetadataReferenceProvider());
    }

    private static void ParseType(string returnType, Func<ExpressionTypeInfo, bool> assert)
    {
        var code = $$"""
                     using System;
                     using System.Collections.Generic;
                     using System.Threading.Tasks;
                     static class E
                     {
                        static {{returnType}} M()=>throw new Exception();
                     }
                     """;
        var semanticModel = ExpressionParser.Parse(code, out var root);

        var methodDecl = root.DescendantNodes().OfType<MethodDeclarationSyntax>().First();
        var parser = new ExpressionParser(semanticModel);
        var res = parser.Visit(methodDecl.ReturnType);
        if (!res.IsTypeInfo)
            throw new Exception("Parse result is not a ExpressionTypeInfo");
        Assert.IsTrue(assert(res.TypeInfo));
    }

    [Test]
    public void ParseVoid() => ParseType("void",
        r => r.Type == ExpressionTypeInfo.KnownType.Void);

    [Test]
    public void ParseObject() => ParseType("object",
        r => r.Type == ExpressionTypeInfo.KnownType.Object);

    [Test]
    public void ParseNullableInt() => ParseType("int?",
        r => r.Type == ExpressionTypeInfo.KnownType.Int32 && r.IsNullable);

    [Test]
    public void ParseGuid() => ParseType("Guid",
        r => r.Type == ExpressionTypeInfo.KnownType.Guid && !r.IsNullable);

    [Test]
    public void ParseArrayOfInt() => ParseType("int[]",
        r => r.Type == ExpressionTypeInfo.KnownType.Array &&
             r.Types![0].Type == ExpressionTypeInfo.KnownType.Int32);

    [Test]
    public void ParseListOfInt() => ParseType("List<int>", r =>
        r.Type == ExpressionTypeInfo.KnownType.List &&
        r.Types!.Length == 1 && r.Types[0].Type == ExpressionTypeInfo.KnownType.Int32);

    [Test]
    public void ParseGenericType() => ParseType("Task<int>",
        r => r.Type == ExpressionTypeInfo.KnownType.Unknown &&
             r.IsGeneric && r.Types!.Length == 1 && r.Types[0].Type == ExpressionTypeInfo.KnownType.Int32);
}