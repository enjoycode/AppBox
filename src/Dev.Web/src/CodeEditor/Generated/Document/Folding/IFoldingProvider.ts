import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export interface IFoldingProvider {
    GenerateFoldMarkers(document: CodeEditor.Document): Nullable<System.List<CodeEditor.FoldMarker>>;
}
