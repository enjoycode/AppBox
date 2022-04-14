import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class TextEditorTheme {
    public FontSize: number = 15;

    public LineSpace: number = 2;

    public CaretColor: PixUI.Color = PixUI.Colors.Red;

    public LineHighlightColor: PixUI.Color = new PixUI.Color(150, 150, 150, 20);

    public SelectionColor: PixUI.Color = new PixUI.Color(167, 209, 255, 50);

    public TextBgColor: PixUI.Color = new PixUI.Color(0xFF2B2B2B);

    public LineBgColor: PixUI.Color = new PixUI.Color(0xFF313335);

    public BracketHighlightPaint: PixUI.Paint = new PixUI.Paint().Init({Color: new PixUI.Color(255, 255, 0, 100)});

    public LineNumberColor: PixUI.Color = new PixUI.Color(0xFF606366);

    public TextStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFFA9B7C7), Height: 1});

    public FoldedTextStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFFA9B7C7), Height: 1});

    private _tokenErrorStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: PixUI.Colors.Red, Height: 1});

    private _tokenTypeStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFF67DBF1), Height: 1});

    private _tokenNumberStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFF6996BD), Height: 1});

    private _tokenStringStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFF98C379), Height: 1});

    private _tokenKeywordStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFFCC7927), Height: 1});

    private _tokenCommentStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFF5F984F), Height: 1});

    private _tokenVariableStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFFE06C75), Height: 1});

    private _tokenFunctionStyle: PixUI.TextStyle = new PixUI.TextStyle({Color: new PixUI.Color(0xFFFFC763), Height: 1});

    public GetTokenStyle(tokenType: CodeEditor.TokenType): PixUI.TextStyle {
        switch (tokenType) {
            case CodeEditor.TokenType.Error:
                return this._tokenErrorStyle;
            case CodeEditor.TokenType.Type:
                return this._tokenTypeStyle;
            case CodeEditor.TokenType.BuiltinType:
                return this._tokenTypeStyle;
            case CodeEditor.TokenType.LiteralNumber:
                return this._tokenNumberStyle;
            case CodeEditor.TokenType.LiteralString:
                return this._tokenStringStyle;
            case CodeEditor.TokenType.Constant:
            case CodeEditor.TokenType.Keyword:
                return this._tokenKeywordStyle;
            case CodeEditor.TokenType.Comment:
                return this._tokenCommentStyle;
            case CodeEditor.TokenType.Variable:
                return this._tokenVariableStyle;
            case CodeEditor.TokenType.Function:
                return this._tokenFunctionStyle;
            default:
                return this.TextStyle;
        }
    }

    public Init(props: Partial<TextEditorTheme>): TextEditorTheme {
        Object.assign(this, props);
        return this;
    }
}
