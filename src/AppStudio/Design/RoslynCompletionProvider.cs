using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppBoxClient;
using CodeEditor;

namespace AppBoxDesign
{
    internal sealed class RoslynCompletionProvider : ICompletionProvider
    {
        internal static readonly RoslynCompletionProvider Default = new RoslynCompletionProvider();
        
        public char[] TriggerCharacters => new char[] { '.' };


        public async Task<IList<ICompletionItem>?> ProvideCompletionItems(Document document,
            int offset, string? completionWord)
        {
           var res = await Channel.Invoke("sys.DesignService.GetCompletion", new object?[]
            {
                0, document.Tag, offset, completionWord
            });
           return (IList<ICompletionItem>?)res;
        }
    }
}