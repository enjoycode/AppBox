import * as CodeEditor from '@/CodeEditor'
import * as System from '@/System'

export class SyntaxParser implements System.IDisposable {
    private static readonly $meta_System_IDisposable = true;
    public static readonly ParserEncoding: number = 1;

    public constructor(document: CodeEditor.Document) {
        this._document = document;
        let language = CodeEditor.TSCSharpLanguage.Get();
        // @ts-ignore for new TSParser();
        this._parser = new window.TreeSitter(); //Don't use Initializer
        this._parser.setLanguage(language);
        this.Language = new CodeEditor.CSharpLanguage();
    }

    private readonly _document: CodeEditor.Document;

    private readonly _parser: CodeEditor.TSParser;
    #Language: CodeEditor.ICodeLanguage;
    public get Language() {
        return this.#Language;
    }

    private set Language(value) {
        this.#Language = value;
    }

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
        this._edit.startIndex = (Math.floor(offset) & 0xFFFFFFFF) * SyntaxParser.ParserEncoding;
        this._edit.oldEndIndex = this._edit.startIndex;
        this._edit.newEndIndex = this._edit.startIndex + (Math.floor(length) & 0xFFFFFFFF) * SyntaxParser.ParserEncoding;
        this._edit.startPosition = CodeEditor.TSPoint.FromLocation((startLocation).Clone());
        this._edit.oldEndPosition = this._edit.startPosition;
    }

    public EndInsert(offset: number, length: number) {
        let endLocation = this._document.OffsetToPosition(offset + length);
        this._edit.newEndPosition = CodeEditor.TSPoint.FromLocation((endLocation).Clone());

        this._oldTree!.edit((this._edit).Clone());

        this.Parse(false);
        this.Tokenize(this._startLineOfChanged, this._endLineOfChanged);
    }

    public BeginRemove(offset: number, length: number) {
        let startLocation = this._document.OffsetToPosition(offset);
        let endLocation = this._document.OffsetToPosition(offset + length);
        this._edit.startIndex = (Math.floor(offset) & 0xFFFFFFFF) * SyntaxParser.ParserEncoding;
        this._edit.oldEndIndex = this._edit.startIndex + (Math.floor(length) & 0xFFFFFFFF) * SyntaxParser.ParserEncoding;
        this._edit.newEndIndex = this._edit.startIndex;
        this._edit.startPosition = CodeEditor.TSPoint.FromLocation((startLocation).Clone());
        this._edit.oldEndPosition = CodeEditor.TSPoint.FromLocation((endLocation).Clone());
        this._edit.newEndPosition = this._edit.startPosition;
    }

    public EndRemove() {
        this._oldTree!.edit((this._edit).Clone());
        this.Parse(false);
        this.Tokenize(this._startLineOfChanged, this._endLineOfChanged);
    }

    public BeginReplace(offset: number, length: number, textLenght: number) {
        let startLocation = this._document.OffsetToPosition(offset);
        let endLocation = this._document.OffsetToPosition(offset + length);
        this._edit.startIndex = (Math.floor(offset) & 0xFFFFFFFF) * SyntaxParser.ParserEncoding;
        this._edit.oldEndIndex = this._edit.startIndex + (Math.floor(length) & 0xFFFFFFFF) * SyntaxParser.ParserEncoding;
        this._edit.newEndIndex = this._edit.startIndex + (Math.floor(((textLenght - length) * SyntaxParser.ParserEncoding)) & 0xFFFFFFFF);
        this._edit.startPosition = CodeEditor.TSPoint.FromLocation((startLocation).Clone());
        this._edit.oldEndPosition = CodeEditor.TSPoint.FromLocation((endLocation).Clone());
    }

    public EndReplace(offset: number, length: number, textLength: number) {
        let endLocation = this._document.OffsetToPosition(offset + (textLength - length));
        this._edit.newEndPosition = CodeEditor.TSPoint.FromLocation((endLocation).Clone());

        this._oldTree!.edit((this._edit).Clone());
        this.Parse(false);
        this.Tokenize(this._startLineOfChanged, this._endLineOfChanged);
    }

    public Parse(reset: boolean) {
        let input = new CodeEditor.ParserInput(this._document.TextBuffer);
        // @ts-ignore
        let newTree = this._parser.parse(input.Read.bind(input), reset === true ? null : this._oldTree);

        //获取变动范围
        if (this._oldTree && !reset) {
            let changes = newTree.getChangedRanges(this._oldTree);

            this._oldTree.delete();

            this._startLineOfChanged = this._edit.startPosition.row;
            this._endLineOfChanged = this._startLineOfChanged + 1;
            for (const range of changes) {
                this._startLineOfChanged = Math.min(this._startLineOfChanged, range.startPosition.row);
                this._endLineOfChanged = Math.max(this._endLineOfChanged, range.endPosition.row);
            }
        }
        this._oldTree = newTree;

        //生成FoldMarkers
        let foldMarkers = this.Language.GenerateFoldMarkers(this._document);
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
        let lineEndPoint = new CodeEditor.TSPoint(line, lineLength * SyntaxParser.ParserEncoding);
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
        if (!this.Language.IsLeafNode(node) && childrenCount > 0) {
            this.VisitChildren(node, lineSegment);
            return;
        }

        // leaf node now
        // 注意: 1.可能跨行的Comment; 2.如下特例(" this._")会产生长度为0的MISSING节点
        // member_access_expression [4, 0] - [4, 6]
        //     expression: this_expression [4, 0] - [4, 4]
        //     name: identifier [4, 5] - [4, 6]
        // MISSING ; [4, 6] - [4, 6]
        if (node.endIndex <= node.startIndex) return;

        let tokenType = this.Language.GetTokenType(node);
        let startOffset = Math.max(node.startIndex / SyntaxParser.ParserEncoding, lineSegment.Offset);
        let length = Math.min((node.endIndex - node.startIndex) / SyntaxParser.ParserEncoding,
            lineSegment.Length);
        lineSegment.AddToken(tokenType, startOffset, length);
    }

    private static ContainsFullLine(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment): boolean {
        let nodeStartOffset = node.startIndex / SyntaxParser.ParserEncoding;
        let nodeEndOffset = node.endIndex / SyntaxParser.ParserEncoding;

        return nodeStartOffset <= lineSegment.Offset &&
            (lineSegment.Offset + lineSegment.Length) <= nodeEndOffset;
    }

    private static BeforeLine(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment): boolean {
        let nodeEndOffset = node.endIndex / SyntaxParser.ParserEncoding;
        return nodeEndOffset < lineSegment.Offset;
    }

    private static AfterLine(node: CodeEditor.TSSyntaxNode, lineSegment: CodeEditor.LineSegment): boolean {
        let nodeStartOffset = node.startIndex / SyntaxParser.ParserEncoding;
        return nodeStartOffset > (lineSegment.Offset + lineSegment.Length);
    }


    public CreateQuery(scm: string): CodeEditor.TSQuery {
        return this._parser.getLanguage().query(scm)!;
    }

    public GetDirtyLines(controller: CodeEditor.CodeEditorController): CodeEditor.DirtyLines {
        return new CodeEditor.DirtyLines(controller).Init(
            {
                StartLine: this._startLineOfChanged,
                EndLine: this._endLineOfChanged
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
}
