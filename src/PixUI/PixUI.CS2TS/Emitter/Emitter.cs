using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace PixUI.CS2TS
{
    /// <summary>
    /// 将Roslyn Document转译为TypeScript或JavaScript
    /// </summary>
    public sealed partial class Emitter : CSharpSyntaxWalker
    {
        private Emitter(Translator translator, Document document, SemanticModel semanticModel,
            bool toJavaScript = false, AppBoxContext? appBoxContext = null)
            : base(SyntaxWalkerDepth.Trivia)
        {
            Translator = translator;
            Document = document;
            SemanticModel = semanticModel;
            ToJavaScript = toJavaScript;
            AppBoxContext = appBoxContext;
            _typeSymbolCache = new TypeSymbolCache(semanticModel);
        }

        public static async Task<Emitter> MakeAsync(Translator translator, Document document,
            bool toJavascript = false, AppBoxContext? appBoxContext = null)
        {
            var semanticModel = await document.GetSemanticModelAsync();
            return new Emitter(translator, document, semanticModel!, toJavascript, appBoxContext);
        }

        private readonly Document Document;
        internal readonly SemanticModel SemanticModel;
        internal readonly Translator Translator;
        internal readonly bool ToJavaScript; //直接翻译为ES2017

        internal readonly AppBoxContext? AppBoxContext;

        // 使用到的模块，用于生成文件头import
        private readonly HashSet<string> _usedModules = new HashSet<string>();

        // 是否需要输出范型的类型，因为ts不支持如GenericType<T>.SomeStaticMethod()
        internal bool NeedGenericTypeArguments = true;

        // 是否忽略委托绑定，事件+= or -=时设为true
        internal bool IgnoreDelegateBind = false;

        // 转为参数时是否将charCode的数值转为js的字符串(因为char会统一转换为number)
        internal bool CharCodeToString = false;

        //公开导出的类型
        private readonly List<BaseTypeDeclarationSyntax> _publicTypes = new();

        //专用于处理IfStatement的IsPatternExpression
        internal IsPatternExpressionSyntax? InjectIsPatternExpression = null;

        private readonly Stack<BlockResources> _blockStack = new Stack<BlockResources>();

        public void Emit() => Visit(SemanticModel.SyntaxTree.GetRoot());

        /// <summary>
        /// 添加使用到的包
        /// </summary>
        internal void AddUsedModule(string moduleName)
        {
            if (!_usedModules.Contains(moduleName))
                _usedModules.Add(moduleName);
        }

        internal void AddPublicType(BaseTypeDeclarationSyntax typeDeclarationSyntax)
            => _publicTypes.Add(typeDeclarationSyntax);

        internal void EnterBlock(BlockSyntax block)
        {
            _blockStack.Push(new BlockResources(block));
        }

        internal void AddUsingResourceToBlock(VariableDeclarationSyntax resource)
        {
            _blockStack.Peek().Add(resource);
        }

        /// <summary>
        /// 离开Block前，如果有需要自动释放的资源生成相关Dispose代码
        /// </summary>
        internal void LeaveBlock(bool lastIsReturnStatement)
        {
            var block = _blockStack.Pop();
            if (!lastIsReturnStatement)
                AutoDisposeBlockResources(block);
        }

        /// <summary>
        /// 在return前如果有需要自动释放的资源生成相关Dispose代码
        /// </summary>
        internal bool AutoDisposeBeforeReturn(ReturnStatementSyntax returnStatement)
        {
            // 如下示例:
            // using var res = new Resource();
            // if (some)
            //     return;
            var autoBlock = returnStatement.Parent is not BlockSyntax &&
                            _blockStack.Any(b => b.Resources != null);
            if (autoBlock)
            {
                WriteLeadingWhitespaceOnly(returnStatement.Parent!);
                Write("{\n");
            }

            //注意需要循环向上处理所有Block，除非是Lambda表达式的Block
            foreach (var block in _blockStack)
            {
                AutoDisposeBlockResources(block, returnStatement);
                if (block.BlockSyntax.Parent is ParenthesizedLambdaExpressionSyntax)
                    break;
            }

            return autoBlock;
        }

        private void AutoDisposeBlockResources(BlockResources block,
            ReturnStatementSyntax? returnStatement = null)
        {
            if (block.Resources == null) return;

            //dispose using resources
            foreach (var resource in block.Resources)
            {
                //TODO:暂简单根据名称特殊处理CanvasKit相关资源Dispose重命名或忽略
                //var typeInfo = SemanticModel.GetTypeInfo(resource.Type);
                var typeInfo = SemanticModel.GetTypeInfo(resource.Variables[0].Initializer!.Value);
                var typeName = typeInfo.Type!.Name;
                var rootNamespace = typeInfo.Type!.GetRootNamespace();
                var renameForCanvasKitResource = false;
                if (rootNamespace is { Name: "PixUI" })
                {
                    if (typeName is "ParagraphStyle" or "RRect" or "TextStyle")
                        continue;
                    if (typeName is "Paint" or "Paragraph" or "ParagraphBuilder" or "Path")
                        renameForCanvasKitResource = true;
                }

                foreach (var variable in resource.Variables)
                {
                    if (returnStatement == null)
                    {
                        WriteLeadingWhitespaceOnly(block.BlockSyntax);
                        Write('\t');
                    }
                    else
                    {
                        WriteLeadingWhitespaceOnly(returnStatement);
                    }

                    Write(variable.Identifier.Text);
                    if (typeInfo.Nullability.FlowState == NullableFlowState.MaybeNull)
                        Write('?');
                    Write(renameForCanvasKitResource ? ".delete();\n" : ".Dispose();\n");
                }
            }
        }
    }

    /// <summary>
    /// Block内需要自动Dispose的资源
    /// </summary>
    internal sealed class BlockResources
    {
        internal readonly BlockSyntax BlockSyntax;

        //需要自动Dispose的资源列表
        internal List<VariableDeclarationSyntax>? Resources { get; private set; }

        internal BlockResources(BlockSyntax blockSyntax)
        {
            BlockSyntax = blockSyntax;
        }

        internal void Add(VariableDeclarationSyntax resource)
        {
            Resources ??= new List<VariableDeclarationSyntax>();
            Resources.Add(resource);
        }
    }
}