using AppBoxCore;
using AppBoxDesign;
using AppBoxDesign.CodeGenerator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using NUnit.Framework;

namespace Tests.Design;

public class ExpressionParseTypeTest
{
    [OneTimeSetUp]
    public static async Task InitSetup()
    {
        // await MetadataReferences.InitAsync(new MockMetadataReferenceProvider());
        _designContext = await DesignHelper.MockDesignContext();
    }

    private static DesignContext _designContext = null!;

    private static string BuildExpressionCode(string returnType)
    {
        return $$"""
                 using System;
                 using System.Collections.Generic;
                 using System.Threading.Tasks;
                 static class E
                 {
                    static {{returnType}} M()=>throw new Exception();
                 }
                 """;
    }

    private static void ParseSystemType(string returnType, Func<ExpressionTypeInfo, bool> assert)
    {
        var code = BuildExpressionCode(returnType);
        var syntaxTree = ExpressionParser.Parse(code);
        var root = syntaxTree.GetCompilationUnitRoot();
        var semanticModel = ExpressionParser.GetSemanticModel(syntaxTree);

        var methodDecl = root.DescendantNodes().OfType<MethodDeclarationSyntax>().First();
        var parser = new ExpressionParser(semanticModel);
        var res = parser.Visit(methodDecl.ReturnType);
        if (!res.IsTypeInfo)
            throw new Exception("Parse result is not a ExpressionTypeInfo");
        Assert.IsTrue(assert(res.TypeInfo));
    }

    /// <summary>
    /// 解析AppBox的模型的虚拟代码的类型
    /// </summary>
    private static async Task ParseAppBoxType(string returnType, Func<ExpressionTypeInfo, bool> assert)
    {
        var prjId = ProjectId.CreateNewId();
        var docId = DocumentId.CreateNewId(prjId);
        _designContext.CreateExpressionProject(prjId, docId, "TestExpression", null);
        
        var code = BuildExpressionCode(returnType);
        await DesignHelper.ReplaceCode(_designContext, docId, code);
        var doc = _designContext.Workspace.CurrentSolution.GetDocument(docId)!;

        var syntaxTree = await doc.GetSyntaxTreeAsync();
        var root = syntaxTree!.GetCompilationUnitRoot();
        var semanticModel = await doc.GetSemanticModelAsync();
        if (semanticModel!.GetDiagnostics().Any(e => e.Severity == DiagnosticSeverity.Error))
            throw new Exception("存在语义错误");

        var methodDecl = root.DescendantNodes().OfType<MethodDeclarationSyntax>().First();
        var parser = new ExpressionParser(semanticModel,
            ExpressionParserOptions.DynamicEntityMemberAccess, _designContext);
        var res = parser.Visit(methodDecl.ReturnType);
        _designContext.RemoveProject(prjId);
        if (!res.IsTypeInfo)
            throw new Exception("Parse result is not a ExpressionTypeInfo");
        Assert.IsTrue(assert(res.TypeInfo));
    }

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