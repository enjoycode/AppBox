import * as AppBoxClient from '@/AppBoxClient'
import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class RoslynCompletionProvider implements CodeEditor.ICompletionProvider {
    public static readonly Default: RoslynCompletionProvider = new RoslynCompletionProvider();

    public get TriggerCharacters(): System.IEnumerable<number> {
        return [46];
    }

    public async ProvideCompletionItems(document: CodeEditor.Document, offset: number, completionWord: Nullable<string>): System.Task<Nullable<System.IList<CodeEditor.ICompletionItem>>> {
        let res = await AppBoxClient.Channel.Invoke("sys.DesignService.GetCompletion", [0, document.Tag, offset, completionWord
        ]);
        return <Nullable<System.IList<CodeEditor.ICompletionItem>>><unknown>res;
    }

    public Init(props: Partial<RoslynCompletionProvider>): RoslynCompletionProvider {
        Object.assign(this, props);
        return this;
    }
}
