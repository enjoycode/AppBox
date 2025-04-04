using System.Collections.Immutable;
using System.Reflection;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Completion;

namespace AppBoxDesign;

internal static class CompletionItemExtensions
{
    private const string GetSymbolsAsync = nameof(GetSymbolsAsync);
    private const string InsertionText = nameof(InsertionText);

    private const string ObjectCreationCompletionProvider =
        "Microsoft.CodeAnalysis.CSharp.Completion.Providers.ObjectCreationCompletionProvider";

    private const string NamedParameterCompletionProvider =
        "Microsoft.CodeAnalysis.CSharp.Completion.Providers.NamedParameterCompletionProvider";

    private const string OverrideCompletionProvider =
        "Microsoft.CodeAnalysis.CSharp.Completion.Providers.OverrideCompletionProvider";

    private const string ParitalMethodCompletionProvider =
        "Microsoft.CodeAnalysis.CSharp.Completion.Providers.PartialMethodCompletionProvider";

    private const string Provider = nameof(Provider);
    private const string ProviderName = nameof(ProviderName);

    private const string SymbolCompletionItem =
        "Microsoft.CodeAnalysis.Completion.Providers.SymbolCompletionItem";

    private const string SymbolCompletionProvider =
        "Microsoft.CodeAnalysis.CSharp.Completion.Providers.SymbolCompletionProvider";

    private const string SymbolKind = nameof(SymbolKind);
    private const string SymbolName = nameof(SymbolName);
    private const string Symbols = nameof(Symbols);

    private static readonly PropertyInfo GetProviderNameProp;
    private static readonly MethodInfo GetSymbolsAsyncMethod;

    static CompletionItemExtensions()
    {
        var symbolCompletionItemType = typeof(CompletionItem).GetTypeInfo().Assembly
            .GetType(SymbolCompletionItem);
        GetSymbolsAsyncMethod = symbolCompletionItemType.GetMethod(GetSymbolsAsync,
            BindingFlags.Public | BindingFlags.Static)!;
        GetProviderNameProp = typeof(CompletionItem).GetProperty(ProviderName,
            BindingFlags.NonPublic | BindingFlags.Instance)!;
    }

    private static string GetProviderName(CompletionItem item)
    {
        return (string)GetProviderNameProp.GetValue(item);
    }

    public static bool IsObjectCreationCompletionItem(this CompletionItem item)
    {
        return GetProviderName(item) == ObjectCreationCompletionProvider;
    }

    public static async Task<IEnumerable<ISymbol>> GetCompletionSymbolsAsync(
        this Microsoft.CodeAnalysis.Completion.CompletionItem completionItem, IEnumerable<ISymbol> recommendedSymbols,
        Document document)
    {
        var properties = completionItem.Properties;

        // for SymbolCompletionProvider, use the logic of extracting information from recommended symbols
        if (properties.TryGetValue(Provider, out var provider) &&
            provider == SymbolCompletionProvider)
        {
            return recommendedSymbols.Where(x =>
                x.Name == properties[SymbolName] &&
                (int)x.Kind == int.Parse(properties[SymbolKind])).Distinct();
        }

        // if the completion provider encoded symbols into Properties, we can return them
        if (properties.ContainsKey(Symbols))
        {
            // the API to decode symbols is not public at the moment
            // http://source.roslyn.io/#Microsoft.CodeAnalysis.Features/Completion/Providers/SymbolCompletionItem.cs,93
            var decodedSymbolsTask =
                GetSymbolsAsyncMethod.InvokeStatic<Task<ImmutableArray<ISymbol>>>(new object[]
                    { completionItem, document, default(CancellationToken) });
            if (decodedSymbolsTask != null)
            {
                return await decodedSymbolsTask;
            }
        }

        return Enumerable.Empty<ISymbol>();
    }

    public static bool UseDisplayTextAsCompletionText(this Microsoft.CodeAnalysis.Completion.CompletionItem completionItem)
    {
        return completionItem.Properties.TryGetValue(Provider, out var provider)
               && (provider == NamedParameterCompletionProvider ||
                   provider == OverrideCompletionProvider ||
                   provider == ParitalMethodCompletionProvider);
    }

    public static bool TryGetInsertionText(this Microsoft.CodeAnalysis.Completion.CompletionItem completionItem,
        out string? insertionText)
    {
        return completionItem.Properties.TryGetValue(InsertionText, out insertionText);
    }
}