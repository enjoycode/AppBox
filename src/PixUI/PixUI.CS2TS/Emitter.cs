using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace PixUI.CS2TS
{
    /// <summary>
    /// 将Roslyn Document转译为TypeScript
    /// </summary>
    public sealed partial class Emitter : CSharpSyntaxWalker
    {
        private Emitter(Translator translator, Document document, SemanticModel semanticModel,
            bool toJavaScript = false, Func<string, bool>? findModel = null)
            : base(SyntaxWalkerDepth.Trivia)
        {
            Translator = translator;
            Document = document;
            SemanticModel = semanticModel;
            ToJavaScript = toJavaScript;
            FindModel = findModel;
            _typeSymbolCache = new TypeSymbolCache(semanticModel);
        }

        public static async Task<Emitter> MakeAsync(Translator translator, Document document,
            bool toJavascript = false, Func<string, bool>? findModel = null)
        {
            var semanticModel = await document.GetSemanticModelAsync();
            return new Emitter(translator, document, semanticModel!, toJavascript, findModel);
        }

        private readonly Document Document;
        internal readonly SemanticModel SemanticModel;
        internal readonly Translator Translator;
        internal readonly bool ToJavaScript; //直接翻译为ES2017
        internal readonly Func<string, bool>? FindModel; //用于AppBox跟踪使用到的模型

        // 使用到的模块，用于生成文件头import
        private readonly HashSet<string> _usedModules = new HashSet<string>();

        // 使用到的模型，用于生成文件头import
        public readonly HashSet<string> UsedModels = new HashSet<string>();

        // 是否需要输出范型的类型，因为ts不支持如GenericType<T>.SomeStaticMethod()
        internal bool NeedGenericTypeArguments = true;

        // 是否忽略委托绑定，事件+= or -=时设为true
        internal bool IgnoreDelegateBind = false;

        // // 用于临时禁止将char字面量转换为js的charCodeAt()
        // internal bool SuspendCharToCode = false;

        //公开导出的类型
        private readonly List<BaseTypeDeclarationSyntax> _publicTypes = new();

        //专用于处理IfStatement的IsPatternExpression
        internal IsPatternExpressionSyntax? InjectIsPatternExpression = null;

        private readonly Stack<BlockResources> _blockStack = new Stack<BlockResources>();

        public void Emit() => Visit(SemanticModel.SyntaxTree.GetRoot());

        internal void AddUsedModule(string moduleName)
        {
            if (!_usedModules.Contains(moduleName))
                _usedModules.Add(moduleName);
        }

        internal void AddUsedModel(string modelFullName)
        {
            if (!UsedModels.Contains(modelFullName))
                UsedModels.Add(modelFullName);
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
        internal void AutoDisposeBeforeReturn()
        {
            var block = _blockStack.Peek();
            AutoDisposeBlockResources(block);
        }

        private void AutoDisposeBlockResources(BlockResources block)
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
                    WriteLeadingWhitespaceOnly(block.BlockSyntax);
                    Write('\t');

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