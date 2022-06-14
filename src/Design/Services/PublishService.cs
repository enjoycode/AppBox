using System.IO.Compression;
using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;

namespace AppBoxDesign;

internal static class PublishService
{
    internal static void ValidateModels(DesignHub hub, PublishPackage package)
    {
        //TODO:
    }

    /// <summary>
    /// 发布或调试时编译服务模型
    /// </summary>
    /// <remarks>
    /// 发布时返回的是已经压缩过的
    /// </remarks>
    internal static async Task<byte[]?> CompileServiceAsync(DesignHub hub, ServiceModel model,
        string? debugFolder = null)
    {
        var forDebug = !string.IsNullOrEmpty(debugFolder);
        //获取RoslynDocumentId
        var designNode = hub.DesignTree.FindModelNode(ModelType.Service, model.Id)!;
        var appName = designNode.AppNode.Model.Name;
        //获取RoslynDocument
        var doc =
            hub.TypeSystem.Workspace.CurrentSolution.GetDocument(designNode.RoslynDocumentId)!;
        var semanticModel = await doc.GetSemanticModelAsync();

        //先检测虚拟代码错误
        var diagnostics = semanticModel!.GetDiagnostics();
        if (diagnostics.Length > 0)
        {
            var hasError = false;
            var sb = new StringBuilder("语法错误:");
            sb.AppendLine();
            for (var i = 0; i < diagnostics.Length; i++)
            {
                var error = diagnostics[i];
                if (error.WarningLevel == 0)
                {
                    hasError = true;
                    sb.AppendFormat("{0}. {1} {2}{3}", i + 1, error.WarningLevel,
                        error.GetMessage(), Environment.NewLine);
                }
            }

            if (hasError)
                throw new Exception(sb.ToString());
        }

        var codegen = new ServiceCodeGenerator(hub, appName, semanticModel, model);
        var newRootNode = codegen.Visit(await semanticModel.SyntaxTree.GetRootAsync());
        //Log.Debug(newRootNode.ToFullString());

        var docName = $"{appName}.Services.{model.Name}";
        var newTree =
            SyntaxFactory.SyntaxTree(newRootNode, path: docName + ".cs", encoding: Encoding.UTF8);
        //注意：必须添加并更改版本号，否则服务端Assembly.Load始终是旧版 
        var newModelVersion = model.Version + 1; //用于消除版本差
        var asmVersion =
            $"{newModelVersion >> 24}.{(newModelVersion >> 16) & 0xFF}.{newModelVersion & 0xFFFF}";
        var usingAndVersionTree = SyntaxFactory.ParseSyntaxTree(
            $"global using System;using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly:TargetFramework(\".NETStandard, Version = v2.1\")][assembly: AssemblyVersion(\"{asmVersion}\")]");
        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
            .WithUsings("System")
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(forDebug ? OptimizationLevel.Debug : OptimizationLevel.Release);
        var deps = new List<MetadataReference>
        {
            MetadataReferences.CoreLib,
            MetadataReferences.NetstandardLib,
            //MetadataReferences.SystemCoreLib,
            // MetadataReferences.SystemCollectionsLib,
            // MetadataReferences.SystemLinqLib,
            MetadataReferences.SystemRuntimeLib,
            // MetadataReferences.SystemRuntimeExtLib,
            // MetadataReferences.SystemTasksLib,
            // MetadataReferences.TasksExtLib,
            // MetadataReferences.DataCommonLib,
            // MetadataReferences.ComponentModelPrimitivesLib,
            //MetadataReferences.ComponentModelLib,
            //MetadataReferences.SystemBuffersLib,
            MetadataReferences.AppBoxCoreLib,
            // MetadataReferences.AppBoxStoreLib
        };

        if (model.HasReference) //添加其他引用
        {
            throw new NotImplementedException("ServiceModel has references");
            // for (int i = 0; i < model.References.Count; i++)
            // {
            //     deps.Add(MetadataReferences.Get($"{model.References[i]}.dll", appName));
            // }
        }

        var compilation = CSharpCompilation.Create(docName)
            .AddReferences(deps)
            .AddSyntaxTrees(newTree, usingAndVersionTree)
            .WithOptions(options);
        EmitResult emitResult;
        byte[]? asmData = null;
        if (forDebug)
        {
            await using var dllStream = new FileStream(Path.Combine(debugFolder!, docName + ".dll"),
                FileMode.CreateNew);
            var emitOpts = new EmitOptions(false, DebugInformationFormat.Embedded);
            //using var pdbStream = new FileStream(Path.Combine(debugFolder, docName + ".pdb"), FileMode.CreateNew);
            emitResult = compilation.Emit(dllStream, null, null, null, null, emitOpts);
        }
        else
        {
            using var dllStream = new MemoryStream(1024);
            await using (var cs = new BrotliStream(dllStream, CompressionMode.Compress, true))
            {
                emitResult = compilation.Emit(cs);
            }

            asmData = dllStream.ToArray();
        }

        //测试写入本地文件系统
        //File.WriteAllBytes(Path.Combine(RuntimeContext.Current.AppPath, $"{appName}.{model.Name}.dll"), asmData);

        if (!emitResult.Success)
        {
            var sb = new StringBuilder("编译错误:");
            sb.AppendLine();
            for (var i = 0; i < emitResult.Diagnostics.Length; i++)
            {
                var error = emitResult.Diagnostics[i];
                sb.AppendFormat("{0}. {1}", i + 1, error);
                sb.AppendLine();
            }

            throw new Exception(sb.ToString());
        }

        return forDebug ? null : asmData;
    }
}