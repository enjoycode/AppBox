using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using AppBoxClient;
using CodeEditor;

namespace AppBoxDesign;

internal sealed class RoslynCompletionProvider : ICompletionProvider
{
    internal static readonly RoslynCompletionProvider Default = new RoslynCompletionProvider();

    public IEnumerable<char> TriggerCharacters => new char[] { '.' };

    public async Task<IList<ICompletionItem>?> ProvideCompletionItems(Document document,
        int offset, string? completionWord)
    {
        var res = await Channel.Invoke<CompletionItem[]?>("sys.DesignService.GetCompletion",
            new object?[] { 0, document.Tag, offset, completionWord });

        if (res == null) return null;

#if __WEB__
            return (IList<ICompletionItem>?)((object)res); //TODO:WebLinq暂不支持Cast()
#else
        return res.Cast<ICompletionItem>().ToList();
#endif
    }
}