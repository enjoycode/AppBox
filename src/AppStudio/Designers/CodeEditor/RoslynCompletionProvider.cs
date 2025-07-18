using AppBoxCore;
using CodeEditor;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Completion;
using Microsoft.CodeAnalysis.Recommendations;
using Document = CodeEditor.Document;

namespace AppBoxDesign;

internal sealed class RoslynCompletionProvider : ICompletionProvider
{
    internal static readonly RoslynCompletionProvider Default = new RoslynCompletionProvider();

    public IEnumerable<char> TriggerCharacters => ['.'];

    public async Task<IList<ICompletionItem>?> ProvideCompletionItems(Document document,
        int offset, string? wordToComplete = "")
    {
        var wants = WantsType.WantDocumentationForEveryCompletionResult | WantsType.WantKind |
                    WantsType.WantReturnType; //暂默认

        var hub = DesignHub.Current;
        ModelId modelId = document.Tag!;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        // var sourceText = await doc.GetTextAsync();
        var service = CompletionService.GetService(doc)!;
        var completionList = await service.GetCompletionsAsync(doc, offset);

        // Only trigger on space if Roslyn has object creation items
        //if (request.TriggerCharacter == " " && !completionList.Items.Any(i => i.IsObjectCreationCompletionItem()))
        //    return completions;

        // get recommened symbols to match them up later with SymbolCompletionProvider
        var semanticModel = await doc.GetSemanticModelAsync();
        var recommendedSymbols = await
            Recommender.GetRecommendedSymbolsAtPositionAsync(semanticModel!, offset, hub.TypeSystem.Workspace);
        var completions = new List<ICompletionItem>(completionList.Items.Length);
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
                        ? ToKind(item.Tags.First())
                        : CompletionItemKind.Text
                };

                completions.Add(response);
            }
        }

        //TODO:处理Overloads

        return completions;
        // return completions
        //     .OrderByDescending(c =>
        //         c.InsertText.IsValidCompletionStartsWithExactCase(wordToComplete))
        //     .ThenByDescending(c =>
        //         c.InsertText.IsValidCompletionStartsWithIgnoreCase(wordToComplete))
        //     .ThenByDescending(c => c.InsertText.IsCamelCaseMatch(wordToComplete))
        //     .ThenByDescending(c => c.InsertText.IsSubsequenceMatch(wordToComplete))
        //     .ThenBy(c => c.Label, StringComparer.OrdinalIgnoreCase)
        //     .ThenBy(c => c.InsertText, StringComparer.OrdinalIgnoreCase)
        //     .ToArray();
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
            response.Kind = ToKind(symbol.GetKind());
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

    internal sealed class CompletionItem : ICompletionItem
    {
        public CompletionItemKind Kind { get; internal set; }
        public string Label { get; internal set; }
        public string? InsertText { get; internal set; }
        public string? Detail { get; internal set; }
        public string? ReturnType { get; internal set; }

        //RequiredNamespaceImport, MethodHeader
        public override string ToString() => $"{Kind}\t\t{Label}";
    }

    private static CompletionItemKind ToKind(string? kindString)
    {
        if (string.IsNullOrEmpty(kindString)
            || !KindsMap.TryGetValue(kindString, out var value))
            return CompletionItemKind.Text;
        return value;
    }

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
}