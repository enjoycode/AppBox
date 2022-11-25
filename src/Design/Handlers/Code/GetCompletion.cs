using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Completion;
using Microsoft.CodeAnalysis.Recommendations;

namespace AppBoxDesign;

internal sealed class GetCompletion : IDesignHandler
{
    private static readonly Dictionary<string, CompletionItemKind> KindsMap = new()
    {
        // Types
        { "Class", CompletionItemKind.Class },
        { "Delegate", CompletionItemKind.Function },
        { "Enum", CompletionItemKind.Enum },
        { "Interface", CompletionItemKind.Interface },
        { "Struct", CompletionItemKind.Struct },
        { "Event", CompletionItemKind.Event },

        // Variables
        { "Local", CompletionItemKind.Variable },
        { "Parameter", CompletionItemKind.Variable },
        { "RangeVariable", CompletionItemKind.Variable },

        // Members
        { "Const", CompletionItemKind.Constant },
        { "EnumMember", CompletionItemKind.EnumMember },
        { "Field", CompletionItemKind.Field },
        { "Method", CompletionItemKind.Method },
        { "Property", CompletionItemKind.Property },

        // Others
        { "Label", CompletionItemKind.Text },
        { "Keyword", CompletionItemKind.Keyword },
        { "Namespace", CompletionItemKind.Module },
    };

    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var targetType = args.GetInt();
        var targetId = args.GetString()!;
        var offset = args.GetInt();
        var wordToComplete = args.GetString() ?? "";

        if (targetType != 0) throw new NotImplementedException("非模型代码智能提示");

        var wants = WantsType.WantDocumentationForEveryCompletionResult | WantsType.WantKind |
                    WantsType.WantReturnType; //暂默认

        ModelId modelId = (long)ulong.Parse(targetId);
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        var sourceText = await doc.GetTextAsync();
        var service = CompletionService.GetService(doc)!;
        var completionList = await service.GetCompletionsAsync(doc, offset);
        if (completionList == null)
            return AnyValue.Empty;

        // Only trigger on space if Roslyn has object creation items
        //if (request.TriggerCharacter == " " && !completionList.Items.Any(i => i.IsObjectCreationCompletionItem()))
        //    return completions;

        // get recommened symbols to match them up later with SymbolCompletionProvider
        var semanticModel = await doc.GetSemanticModelAsync();
        var recommendedSymbols =
            Recommender.GetRecommendedSymbolsAtPosition(semanticModel!, offset,
                hub.TypeSystem.Workspace);
        var completions = new List<CompletionItem>(completionList.Items.Length);
        foreach (var item in completionList.Items)
        {
            var completionText = item.DisplayText;
            if (completionText.IsValidCompletionFor(wordToComplete))
            {
                var symbols = await item.GetCompletionSymbolsAsync(recommendedSymbols, doc);
                if (symbols.Any())
                {
                    foreach (var symbol in symbols)
                    {
                        if (item.UseDisplayTextAsCompletionText())
                        {
                            completionText = item.DisplayText;
                        }
                        else if (item.TryGetInsertionText(out var insertionText))
                        {
                            completionText = insertionText;
                        }
                        else
                        {
                            completionText = symbol.Name;
                        }

                        if (symbol != null)
                        {
                            if ((wants & WantsType.WantSnippet) == WantsType.WantSnippet)
                            {
                                // foreach (var completion in MakeSnippetedResponses(request, symbol, completionText))
                                // {
                                //     completions.Add(completion);
                                // }
                            }
                            else
                            {
                                completions.Add(MakeCompletionItem(wants, symbol, completionText));
                            }
                        }
                    }

                    // if we had any symbols from the completion, we can continue, otherwise it means
                    // the completion didn't have an associated symbol so we'll add it manually
                    continue;
                }

                // for other completions, i.e. keywords, create a simple AutoCompleteResponse
                // we'll just assume that the completion text is the same
                // as the display text.
                var response = new CompletionItem
                {
                    InsertText = item.DisplayText,
                    Label = item.DisplayText,
                    //Snippet = item.DisplayText,
                    Kind = (wants & WantsType.WantKind) == WantsType.WantKind
                        ? item.Tags.First()
                        : null
                };

                completions.Add(response);
            }
        }

        //TODO:处理Overloads


        return AnyValue.From(completions.ToArray());
        // return AnyValue.From(completions
        //     .OrderByDescending(c =>
        //         c.InsertText.IsValidCompletionStartsWithExactCase(wordToComplete))
        //     .ThenByDescending(c =>
        //         c.InsertText.IsValidCompletionStartsWithIgnoreCase(wordToComplete))
        //     .ThenByDescending(c => c.InsertText.IsCamelCaseMatch(wordToComplete))
        //     .ThenByDescending(c => c.InsertText.IsSubsequenceMatch(wordToComplete))
        //     .ThenBy(c => c.Label, StringComparer.OrdinalIgnoreCase)
        //     .ThenBy(c => c.InsertText, StringComparer.OrdinalIgnoreCase)
        //     .ToArray());
    }

    private static CompletionItem MakeCompletionItem(WantsType wants, ISymbol symbol,
        string? completionText, bool includeOptionalParams = true)
    {
        var displayNameGenerator = new SnippetGenerator();
        displayNameGenerator.IncludeMarkers = false;
        displayNameGenerator.IncludeOptionalParameters = includeOptionalParams;

        var response = new CompletionItem();
        response.InsertText = completionText;

        // TODO: Do something more intelligent here
        response.Label = displayNameGenerator.Generate(symbol);

        // if ((wants & WantsType.WantDocumentationForEveryCompletionResult) ==
        //     WantsType.WantDocumentationForEveryCompletionResult)
        // {
        //     response.Detail = DocumentationConverter.ConvertDocumentation(
        //         symbol.GetDocumentationCommentXml(), "\n" /*_formattingOptions.NewLine*/);
        // }

        if ((wants & WantsType.WantReturnType) == WantsType.WantReturnType)
        {
            response.ReturnType = ReturnTypeFormatter.GetReturnType(symbol);
        }

        if ((wants & WantsType.WantKind) == WantsType.WantKind)
        {
            response.Kind = symbol.GetKind();
        }

        // if (request.WantSnippet)
        // {
        //     var snippetGenerator = new SnippetGenerator();
        //     snippetGenerator.IncludeMarkers = true;
        //     snippetGenerator.IncludeOptionalParameters = includeOptionalParams;
        //     response.Snippet = snippetGenerator.Generate(symbol);
        // }

        // if (request.WantMethodHeader)
        // {
        //     response.MethodHeader = displayNameGenerator.Generate(symbol);
        // }

        return response;
    }

    internal struct CompletionItem : IBinSerializable
    {
        public string? Kind;
        public string Label;
        public string InsertText;
        public string? Detail;
        public string? ReturnType;

        //RequiredNamespaceImport, MethodHeader
        public override string ToString() => $"{Kind}\t\t{Label}";

        public void WriteTo(IOutputStream ws)
        {
            ws.WriteByte((byte)ToKind(Kind));
            ws.WriteString(Label);
            ws.WriteString(InsertText == Label ? null : InsertText); //相同不需要重复输出
            ws.WriteString(Detail);
            //ws.WriteString(ReturnType);
        }

        public void ReadFrom(IInputStream rs) => throw new NotSupportedException();
    }

    private static CompletionItemKind ToKind(string? kindString)
    {
        if (string.IsNullOrEmpty(kindString)
            || !KindsMap.TryGetValue(kindString, out var value))
            return CompletionItemKind.Text;
        return value;
    }

    [Flags]
    private enum WantsType
    {
        None = 0,

        /// <summary>
        ///   Specifies whether to return the code documentation for
        ///   each and every returned autocomplete result.
        /// </summary>
        WantDocumentationForEveryCompletionResult = 1,

        /// <summary>
        ///   Specifies whether to return importable types. Defaults to
        ///   false. Can be turned off to get a small speed boost.
        /// </summary>
        WantImportableTypes = 2,

        /// <summary>
        /// Returns a 'method header' for working with parameter templating.
        /// </summary>
        WantMethodHeader = 4,

        /// <summary>
        /// Returns a snippet that can be used by common snippet libraries
        /// to provide parameter and type parameter placeholders
        /// </summary>
        WantSnippet = 8,

        /// <summary>
        /// Returns the return type
        /// </summary>
        WantReturnType = 16,

        /// <summary>
        /// Returns the kind (i.e Method, Property, Field)
        /// </summary>
        WantKind = 32
    }

    /// <summary>
    /// 与CodeEditor的定义必须一致
    /// </summary>
    private enum CompletionItemKind
    {
        Method,
        Function,
        Constructor,
        Field,
        Variable,
        Class,
        Struct,
        Interface,
        Module,
        Property,
        Event,
        Operator,
        Unit,
        Value,
        Constant,
        Enum,
        EnumMember,
        Keyword,
        Text,
        Color,
        File,
        Reference,
        CustomColor,
        Folder,
        TypeParameter,
        User,
        Issue,
        Snippet
    }
}