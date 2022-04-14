import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class TextEditorOptions {
    public TabIndent: number = 4;
    public IndentationSize: number = 4;
    public IndentStyle: CodeEditor.IndentStyle = CodeEditor.IndentStyle.Smart;
    public DocumentSelectionMode: CodeEditor.DocumentSelectionMode = CodeEditor.DocumentSelectionMode.Normal;
    public BracketMatchingStyle: CodeEditor.BracketMatchingStyle = CodeEditor.BracketMatchingStyle.After;
    public AllowCaretBeyondEOL: boolean = false;
    public CaretLine: boolean = false;
    public ShowMatchingBracket: boolean = true;
    public ShowLineNumbers: boolean = true;
    public ShowSpaces: boolean = false;
    public ShowTabs: boolean = false;
    public ShowEOLMarker: boolean = false;
    public ShowInvalidLines: boolean = false;
    public IsIconBarVisible: boolean = false;
    public EnableFolding: boolean = true;
    public ShowHorizontalRuler: boolean = false;
    public ShowVerticalRuler: boolean = false;
    public ConvertTabsToSpaces: boolean = false;
    public MouseWheelScrollDown: boolean = true;
    public MouseWheelTextZoom: boolean = true;
    public HideMouseCursor: boolean = false;
    public CutCopyWholeLine: boolean = true;
    public VerticalRulerRow: number = 80;
    public LineViewerStyle: CodeEditor.LineViewerStyle = CodeEditor.LineViewerStyle.None;
    public LineTerminator: string = "\n";
    public AutoInsertCurlyBracket: boolean = true;
    public SupportReadOnlySegments: boolean = false;

    public Init(props: Partial<TextEditorOptions>): TextEditorOptions {
        Object.assign(this, props);
        return this;
    }
}
