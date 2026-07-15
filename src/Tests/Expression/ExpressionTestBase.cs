using System.Diagnostics;
using AppBoxCore;
using AppBoxDesign;
using AppBoxDesign.CodeGenerator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using NUnit.Framework;

namespace Tests.Design;

public abstract class ExpressionTestBase
{
    [OneTimeSetUp]
    public async Task InitSetup()
    {
        //await MetadataReferences.InitAsync(new MockMetadataReferenceProvider());
        DesignContext = await DesignHelper.MockDesignContext();
    }

    protected DesignContext DesignContext = null!;

    private static string BuildExpressionCode(string statements, string returnType = "void", string parameters = "")
    {
        return $$"""
                 using System;
                 using System.Threading.Tasks;
                 using System.Collections.Generic;
                 static class C{
                   static {{returnType}} M({{parameters}}){
                       {{statements}}
                   }
                 }
                 """;
    }

    private async Task<SemanticModel> CreateExpressionProject(ProjectId prjId, string code)
    {
        var docId = DocumentId.CreateNewId(prjId);
        DesignContext.CreateExpressionProject(prjId, docId, "TestExpression", null,
            DesignContext.ReferencedAppBoxProjects.Model);

        await DesignHelper.ReplaceCode(DesignContext, docId, code);
        var doc = DesignContext.Workspace.CurrentSolution.GetDocument(docId)!;

        // var syntaxTree = await doc.GetSyntaxTreeAsync();
        //var root = syntaxTree!.GetCompilationUnitRoot(); 
        var semanticModel = (await doc.GetSemanticModelAsync());
        if (semanticModel == null)
            throw new Exception("Can't get SemanticModel");
        if (semanticModel.GetDiagnostics().Any(e => e.Severity == DiagnosticSeverity.Error))
            throw new Exception("存在语义错误");
        return semanticModel;
    }

    protected static void ParseSystemType(string returnType, Func<ExpressionTypeInfo, bool> assert)
    {
        var code = BuildExpressionCode("throw new Exception();", returnType);
        var syntaxTree = ExpressionParser.CodeToSyntaxTree(code);
        var root = syntaxTree.GetCompilationUnitRoot();
        var semanticModel = ExpressionParser.GetAndCheckSemanticModel(syntaxTree);

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
    protected async Task ParseAppBoxType(string returnType, Func<ExpressionTypeInfo, bool> assert)
    {
        var code = BuildExpressionCode("throw new Exception();", returnType);
        var prjId = ProjectId.CreateNewId();
        var semanticModel = await CreateExpressionProject(prjId, code);
        var root = semanticModel.SyntaxTree.GetCompilationUnitRoot();

        var methodDecl = root.DescendantNodes().OfType<MethodDeclarationSyntax>().First();
        var parser = new ExpressionParser(semanticModel,
            ExpressionParserOptions.DynamicEntityMemberAccess, DesignContext);
        var res = parser.Visit(methodDecl.ReturnType);
        DesignContext.RemoveProject(prjId);
        if (!res.IsTypeInfo)
            throw new Exception("Parse result is not a ExpressionTypeInfo");
        Assert.IsTrue(assert(res.TypeInfo));
    }

    protected static async Task EvalExpression(string lineCode, string returnType = "void",
        Func<AnyValue, bool>? assert = null)
    {
        var exp = ParseExpression(lineCode, returnType);

        var ts = Stopwatch.GetTimestamp();
        var evaluator = new ExpressionEvaluator(ExpressionContext.Default);
        var result = await evaluator.Visit(exp);
        Console.WriteLine($"Eval used: {Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");

        assert?.Invoke(result);
    }

    protected static Expression ParseExpression(string lineCode, string returnType = "void", string parameters = "")
    {
        var code = BuildExpressionCode(lineCode, returnType, parameters);

        var ts = Stopwatch.GetTimestamp();
        var exp = ExpressionParser.CodeToExpression(code);
        Console.WriteLine($"Parse used: {Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");
        return exp;
    }

    protected async Task EvalAppBoxExpression(string lineCode, string returnType = "void", string parameters = "",
        Dictionary<string, AnyValue>? arguments = null,
        Func<AnyValue, bool>? assert = null)
    {
        var exp = await ParseAppBoxExpression(lineCode, returnType, parameters);
        var evaluator = new ExpressionEvaluator(new MockExpressionContext(arguments));
        var result = await evaluator.Visit(exp);

        assert?.Invoke(result);
    }

    protected async Task<Expression> ParseAppBoxExpression(string lineCode, string returnType = "void",
        string parameters = "")
    {
        var code = BuildExpressionCode(lineCode, returnType, parameters);
        var prjId = ProjectId.CreateNewId();
        var semanticModel = await CreateExpressionProject(prjId, code);
        var expression = ExpressionParser.Parse(semanticModel, ExpressionParserOptions.DynamicEntityMemberAccess,
            DesignContext);
        DesignContext.RemoveProject(prjId);
        return expression;
    }

    private sealed class MockExpressionContext : ExpressionContext
    {
        public MockExpressionContext(Dictionary<string, AnyValue>? arguments)
        {
            _arguments = arguments;
        }

        private readonly Dictionary<string, AnyValue>? _arguments;

        public override AnyValue ResolveParameter(string parameterName)
        {
            if (_arguments != null && _arguments.TryGetValue(parameterName, out var value))
                return value;

            return base.ResolveParameter(parameterName);
        }
    }
}