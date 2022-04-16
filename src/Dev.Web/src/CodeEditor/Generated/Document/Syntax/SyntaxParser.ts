import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class SyntaxParser implements System.IDisposable {
    public constructor(document: CodeEditor.Document) {
        this._document = document;
        let language = CodeEditor.TSLanguage.GetCSharpLanguage();
        this._parser = new CodeEditor.TSParser().Init({Language: language});
        this._language = new CodeEditor.CSharpLanguage();
    }

    private readonly _document: CodeEditor.Document;

    private readonly _parser: CodeEditor.TSParser;
    private readonly _language: CodeEditor.ICodeLanguage;

    private _oldTree: Nullable<CodeEditor.TSTree>;
    private _edit: CodeEditor.TSEdit = new CodeEditor.TSEdit();

    public get RootNode(): Nullable<CodeEditor.TSSyntaxNode> {
        return this._oldTree?.rootNode;
    }

    //重新Parse后受影响的行范围(需要重新绘制)
    private _startLineOfChanged: number = 0;
    private _endLineOfChanged: number = 0;


    public BeginInsert(offset: number, length: number) {
        let startLocation = this._document.OffsetToPosition(offset);
        this._edit.startIndex = <number><any>offset * 2;
        this._edit.oldEndIndex = this._edit.startIndex;
        this._edit.newEndIndex = this._edit.startIndex + <number><any>length * 2;
        this._edit.startPosition = CodeEditor.TSPoint.FromLocation(startLocation);
        this._edit.oldEndPosition = this._edit.startPosition;
    }

    public EndInsert(offset: number, length: number) {
        let endLocation = this._document.OffsetToPosition(offset + length);
        this._edit.newEndPosition = CodeEditor.TSPoint.FromLocation(endLocation);

        this._oldTree!.edit(this._edit);

        this.Parse(false);
        this.Tokenize(this._startLineOfChanged, this._endLineOfChanged + 1);
    }

    public BeginRemove(offset: number, length: number) {
        let startLocation = this._document.OffsetToPosition(offset);
        let endLocation = this._document.OffsetToPosition(offset + length);
        this._edit.startIndex = <number><any>offset * 2;
        this._edit.oldEndIndex = this._edit.startIndex + <number><any>length * 2;
        this._edit.newEndIndex = this._edit.startIndex;
        this._edit.startPosition = CodeEditor.TSPoint.FromLocation(startLocation);
        this._edit.oldEndPosition = CodeEditor.TSPoint.FromLocation(endLocation);
        this._edit.newEndPosition = this._edit.startPosition;
    }

    public EndRemove() {
        this._oldTree!.edit(this._edit);
        this.Parse(false);
        this.Tokenize(this._startLineOfChanged, this._endLineOfChanged + 1);
    }

    public BeginReplace(offset: number, length: number, textLenght: number) {
        let startLocation = this._document.OffsetToPosition(offset);
        let endLocation = this._document.OffsetToPosition(offset + length);
        this._edit.startIndex = <number><any>offset * 2;
        this._edit.oldEndIndex = this._edit.startIndex + <number><any>length * 2;
        this._edit.newEndIndex = this._edit.startIndex + <number><any>((textLenght - length) * 2);
        this._edit.startPosition = CodeEditor.TSPoint.FromLocation(startLocation);
        this._edit.oldEndPosition = CodeEditor.TSPoint.FromLocation(endLocation);
    }

    public EndReplace(offset: number, length: number, textLength: number) {
        let endLocation = this._document.OffsetToPosition(offset + (textLength - length));
        this._edit.newEndPosition = CodeEditor.TSPoint.FromLocation(endLocation);

        this._oldTree!.edit(this._edit);
        this.Parse(false);
        this.Tokenize(this._startLineOfChanged, this._endLineOfChanged + 1);
    }


    public Parse(reset: boolean) {

        //生成FoldMarkers
        let foldMarkers = this._language.GenerateFoldMarkers(this._document);
        this._document.FoldingManager.UpdateFoldings(foldMarkers);
    }

    public Tokenize(startLine: number, endLine: number) {
        for (let i = startLine; i < endLine; i++) {
            this.TokenizeLine(i);
        }
    }

    public TokenizeLine(line: number) {
        let lineSegment = this._document.GetLineSegment(line);
        let lineLength = lineSegment.Length;
        if (lineLength == 0) return;

        let lineStartPoint = new CodeEditor.TSPoint(line, 0);
        let lineEndPoint = new CodeEditor.TSPoint(line, lineLength * 2);
        let lineNode = this._oldTree!.rootNode.namedDescendantForPosition(lineStartPoint, lineEndPoint);
        // Console.WriteLine(lineNode);

        lineSegment.BeginTokenize();

        if (SyntaxParser.ContainsFullLine(lineNode!, lineSegment)) {
            this.VisitNode(lineNode!, lineSegment);
        } else {
            //TODO:
            lineSegment.AddToken(CodeEditor.TokenType.Unknown, lineSegment.Offset, lineSegment.Length);
        }

        lineSegment.EndTokenize();

        //CodeToken.DumpLineTokens(lineSegment, _document);
    }

    private VisitChildren(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment) {
        for (const child of node.children) {
            if (SyntaxParser.BeforeLine(child, lineSegment)) continue;
            if (SyntaxParser.AfterLine(child, lineSegment)) break;
            this.VisitNode(child, lineSegment);
        }
    }

    private VisitNode(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment) {
        let childrenCount = node.childCount;
        if (!this._language.IsLeafNode(node) && childrenCount > 0) {
            this.VisitChildren(node, lineSegment);
            return;
        }

        // leaf node now, 注意可能跨行的Comment
        let tokenType = this._language.GetTokenType(node);
        let startOffset = Math.max(node.startIndex / 2, lineSegment.Offset);
        let length = Math.min((node.endIndex - node.startIndex) / 2, lineSegment.Length);
        lineSegment.AddToken(tokenType, startOffset, length);
    }

    private static ContainsFullLine(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment): boolean {
        let nodeStartOffset = node.startIndex / 2;
        let nodeEndOffset = node.endIndex / 2;

        return nodeStartOffset <= lineSegment.Offset &&
            (lineSegment.Offset + lineSegment.Length) <= nodeEndOffset;
    }

    private static BeforeLine(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment): boolean {
        let nodeEndOffset = node.endIndex / 2;
        return nodeEndOffset < lineSegment.Offset;
    }

    private static AfterLine(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment): boolean {
        let nodeStartOffset = node.startIndex / 2;
        return nodeStartOffset > (lineSegment.Offset + lineSegment.Length);
    }


    public CreateQuery(scm: string): CodeEditor.TSQuery {
        return this._parser.getLanguage().query(scm)!;
    }

    public GetDirtyLines(controller: CodeEditor.CodeEditorController): CodeEditor.DirtyLines {
        return new CodeEditor.DirtyLines(controller).Init({
            StartLine: this._startLineOfChanged, EndLine: this._endLineOfChanged
        });
    }

    public DumpTree() {
        if (this._oldTree == null)
            console.log("No parsed tree.");
        console.log(this._oldTree!.rootNode);
    }

    public Dispose() {
        this._oldTree?.delete();
        this._parser.delete();
    }

    public Init(props: Partial<SyntaxParser>): SyntaxParser {
        Object.assign(this, props);
        return this;
    }
}
