import * as CodeEditor from '@/CodeEditor'

export interface ICodeLanguage extends CodeEditor.ITokensProvider, CodeEditor.IFoldingProvider {
    GetAutoColsingPairs(ch: number): Nullable<number>;
}
