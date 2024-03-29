import Parser, {Language} from 'web-tree-sitter'

export type TSParser = Parser

export type {
    SyntaxNode as TSSyntaxNode,
    Tree as TSTree,
    Query as TSQuery,
} from 'web-tree-sitter'

export class TSCSharpLanguage {
    private static _csharp: Language;

    public static Init(csharp: Language) {
        this._csharp = csharp;
    }

    public static Get(): Language {
        return this._csharp;
    }
}

export * from './Generated/Gui/Signature/ISignatureProvider'
export * from './ParserInput'
export * from './Generated/TreeSitter/Common/TSPoint'
export * from './Generated/TreeSitter/Common/TSEdit'

export * from './Generated/Utils/RedBlackTree'
export * from './Generated/Utils/TextUtils'

export * from './Generated/Document/TextBuffer/ITextBuffer'
export * from './Generated/Document/TextBuffer/ImmutableTextNode'
export * from './Generated/Document/TextBuffer/ImmutableText'
export * from './Generated/Document/TextBuffer/ImmutableTextBuffer'

export * from './Generated/Document/Selection/ColumnRange'
export * from './Generated/Document/Selection/Selection'
export * from './Generated/Document/Selection/SelectionManager'

export * from "./Generated/Actions/ClipboardCommands"

export * from './Generated/Document/Folding/FoldMarker'
export * from './Generated/Document/Folding/IFoldingProvider'
export * from './Generated/Document/Folding/FoldingManager'

export * from './Generated/Document/Syntax/CodeToken'
export * from './Generated/Document/Syntax/ICodeLanguage'
export * from './Generated/Document/Syntax/ITokensProvider'
export * from './Generated/Document/Syntax/CSharpLanguage'
export * from './Generated/Document/Syntax/SyntaxParser'

export * from './Generated/Document/LineManager/DeferredEventList'
export * from './Generated/Document/LineManager/LineSegment'
export * from './Generated/Document/LineManager/LineSegmentTree'
export * from './Generated/Document/LineManager/LineManagerEventArgs'
export * from './Generated/Document/LineManager/LineManager'

export * from './Generated/Undo/IUndoableOperation'
export * from './Generated/Undo/UndoStack'
export * from './Generated/Undo/UndoQueue'
export * from './Generated/Undo/UndoableDelete'
export * from './Generated/Undo/UndoableInsert'
export * from './Generated/Undo/UndoableReplace'
export * from './Generated/Undo/UndoableSetCaretPosition'

export * from './Generated/Document/Enums'
export * from './Generated/Document/TextLocation'
export * from './Generated/Document/ISegment'
export * from './Generated/Document/TextAnchor'
export * from './Generated/Document/TextEditorOptions'
export * from './Generated/Document/DocumentEventArgs'
export * from './Generated/Document/Document'

export * from './Generated/Actions/IEditCommand'
export * from './Generated/Actions/CaretCommands'
export * from './Generated/Actions/MiscCommands'

export * from './Generated/Gui/EditorAreas/EditorArea'
export * from './Generated/Gui/EditorAreas/TextView'
export * from './Generated/Gui/EditorAreas/FoldArea'
export * from './Generated/Gui/EditorAreas/GutterArea'

export * from './Generated/Gui/Completion/CompletionItemKind'
export * from './Generated/Gui/Completion/ICompletionProvider'
export * from './Generated/Gui/Completion/CompletionItemWidget'
export * from './Generated/Gui/Completion/CompletionContext'

export * from './Generated/Gui/Caret'
export * from './Generated/Gui/DirtyLines'
export * from './Generated/Gui/TextEditorTheme'
export * from './Generated/Gui/TextEditor'
export * from './Generated/Gui/EditorDecorator'
export * from './Generated/Gui/CodeEditorController'
export * from './Generated/Gui/CodeEditorWidget'
