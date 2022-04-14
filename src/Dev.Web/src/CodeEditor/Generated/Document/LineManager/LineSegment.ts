import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class LineSegment implements CodeEditor.ISegment {
    public TreeEntry: CodeEditor.LinesEnumerator = CodeEditor.LinesEnumerator.Invalid;

    public get IsDeleted(): boolean {
        return !this.TreeEntry.IsValid;
    }

    public get LineNumber(): number {
        return this.TreeEntry.CurrentIndex;
    }

    public get Offset(): number {
        return this.TreeEntry.CurrentOffset;
    }

    public set Offset(value: number) {
        throw new System.NotSupportedException();
    }

    public get Length(): number {
        return this.TotalLength - this.DelimiterLength;
    }

    public set Length(value: number) {
        throw new System.NotSupportedException();
    }

    #TotalLength: number = 0;
    public get TotalLength() {
        return this.#TotalLength;
    }

    public set TotalLength(value) {
        this.#TotalLength = value;
    }

    #DelimiterLength: number = 0;
    public get DelimiterLength() {
        return this.#DelimiterLength;
    }

    public set DelimiterLength(value) {
        this.#DelimiterLength = value;
    }

    private _lineTokens: Nullable<System.IList<number>>;
    private _tokenColumnIndex: number = 0; //仅用于Tokenize时缓存
    private _cachedParagraph: Nullable<PixUI.Paragraph>;

    #CachedFolds: Nullable<System.IList<CachedFoldInfo>>;
    public get CachedFolds() {
        return this.#CachedFolds;
    }

    private set CachedFolds(value) {
        this.#CachedFolds = value;
    }


    // Util.WeakCollection<TextAnchor> anchors;
    //
    // public TextAnchor CreateAnchor(int column)
    // {
    // 	if (column < 0 || column > Length)
    // 		throw new ArgumentOutOfRangeException("column");
    // 	TextAnchor anchor = new TextAnchor(this, column);
    // 	AddAnchor(anchor);
    // 	return anchor;
    // }
    //
    // void AddAnchor(TextAnchor anchor)
    // {
    // 	Debug.Assert(anchor.Line == this);
    //
    // 	if (anchors == null)
    // 		anchors = new Util.WeakCollection<TextAnchor>();
    //
    // 	anchors.Add(anchor);
    // }


    public InsertedLinePart(manager: CodeEditor.LineManager, startColumn: number, length: number) {
        if (length == 0) return;

        this.ClearFoldedLineCache(manager);

        //TODO:
        //Console.WriteLine("InsertedLinePart " + startColumn + ", " + length);
        // if (anchors != null) {
        // 	foreach (TextAnchor a in anchors) {
        // 		if (a.MovementType == AnchorMovementType.BeforeInsertion
        // 		    ? a.ColumnNumber > startColumn
        // 		    : a.ColumnNumber >= startColumn)
        // 		{
        // 			a.ColumnNumber += length;
        // 		}
        // 	}
        // }
    }

    public RemovedLinePart(manager: CodeEditor.LineManager, deferredEventList: CodeEditor.DeferredEventList, startColumn: number, length: number) {
        if (length == 0) return;

        this.ClearFoldedLineCache(manager);

        //Console.WriteLine("RemovedLinePart " + startColumn + ", " + length);
        //TODO: anchors
        // if (anchors != null) {
        // 	List<TextAnchor> deletedAnchors = null;
        // 	foreach (TextAnchor a in anchors) {
        // 		if (a.ColumnNumber > startColumn) {
        // 			if (a.ColumnNumber >= startColumn + length) {
        // 				a.ColumnNumber -= length;
        // 			} else {
        // 				if (deletedAnchors == null)
        // 					deletedAnchors = new List<TextAnchor>();
        // 				a.Delete(ref deferredEventList);
        // 				deletedAnchors.Add(a);
        // 			}
        // 		}
        // 	}
        // 	if (deletedAnchors != null) {
        // 		foreach (TextAnchor a in deletedAnchors) {
        // 			anchors.Remove(a);
        // 		}
        // 	}
        // }
    }

    public Deleted(deferredEventList: CodeEditor.DeferredEventList) {
        this.TreeEntry = CodeEditor.LinesEnumerator.Invalid;

        // TODO: anchors
        // if (anchors != null) {
        // 	foreach (TextAnchor a in anchors) {
        // 		a.Delete(ref deferredEventList);
        // 	}
        // 	anchors = null;
        // }
    }

    public MergedWith(deletedLine: LineSegment, firstLineLength: number) {
        // TODO: anchors
        // if (deletedLine.anchors != null) {
        // 	foreach (TextAnchor a in deletedLine.anchors) {
        // 		a.Line = this;
        // 		AddAnchor(a);
        // 		a.ColumnNumber += firstLineLength;
        // 	}
        // 	deletedLine.anchors = null;
        // }
    }

    public SplitTo(followingLine: LineSegment) {
        // TODO: anchors
        // if (anchors != null) {
        // 	List<TextAnchor>? movedAnchors = null;
        // 	foreach (TextAnchor a in anchors) {
        // 		if (a.MovementType == AnchorMovementType.BeforeInsertion
        // 		    ? a.ColumnNumber > this.Length
        // 		    : a.ColumnNumber >= this.Length)
        // 		{
        // 			a.Line = followingLine;
        // 			followingLine.AddAnchor(a);
        // 			a.ColumnNumber -= this.Length;
        //
        // 			if (movedAnchors == null)
        // 				movedAnchors = new List<TextAnchor>();
        // 			movedAnchors.Add(a);
        // 		}
        // 	}
        // 	if (movedAnchors != null) {
        // 		foreach (TextAnchor a in movedAnchors) {
        // 			anchors.Remove(a);
        // 		}
        // 	}
        // }
    }


    public BeginTokenize() {
        this.ClearCachedParagraph();
        this._lineTokens = new System.List<number>();
        this._tokenColumnIndex = 0;
    }

    public AddToken(type: CodeEditor.TokenType, offset: number, length: number) {
        let column = offset - this.Offset;
        //处理行首或间隙空格
        if (column > this._tokenColumnIndex) {
            this._lineTokens!.Add(CodeEditor.CodeToken.Make(CodeEditor.TokenType.WhiteSpace, this._tokenColumnIndex));
            this._tokenColumnIndex = column;
        }

        this._lineTokens!.Add(CodeEditor.CodeToken.Make(type, column));
        this._tokenColumnIndex += length;
    }

    public EndTokenize() {
        // 处理行尾空格
        if (this._tokenColumnIndex < this.Length) {
            this._lineTokens!.Add(CodeEditor.CodeToken.Make(CodeEditor.TokenType.WhiteSpace, this._tokenColumnIndex));
        }
    }


    public GetLineParagraph(editor: CodeEditor.TextEditor): PixUI.Paragraph {
        if (this._cachedParagraph != null) return this._cachedParagraph!;

        let ps = new PixUI.ParagraphStyle({maxLines: 1, heightMultiplier: 1});
        let pb = new PixUI.ParagraphBuilder(ps);

        if (this._lineTokens == null || this.Length == 0) {
            let lineText = editor.Document.GetText(this.Offset, this.Length);
            pb.pushStyle(editor.Theme.TextStyle);
            pb.addText(lineText);
        } else {
            if (editor.Document.TextEditorOptions.EnableFolding)
                this.BuildParagraphByFoldings(pb, editor);
            else
                this.BuildParagraphByTokens(pb, editor, 0, this.Length);
        }

        this._cachedParagraph = pb.build();
        this._cachedParagraph!.layout(Number.POSITIVE_INFINITY);
        pb.delete();

        return this._cachedParagraph!;
    }

    private BuildParagraphByTokens(pb: PixUI.ParagraphBuilder, editor: CodeEditor.TextEditor, startIndex: number, endIndex: number) {
        let token = 0;
        let tokenStartColumn = 0;
        let tokenEndColumn = 0;
        let tokenOffset = 0;
        for (let i = 0; i < this._lineTokens!.length; i++) {
            token = this._lineTokens[i];
            tokenStartColumn = CodeEditor.CodeToken.GetTokenStartColumn(token);
            tokenEndColumn = i == this._lineTokens.length - 1
                ? this.Length
                : CodeEditor.CodeToken.GetTokenStartColumn(this._lineTokens[i + 1]);

            if (startIndex >= tokenEndColumn) continue;

            // get token text, TODO: 优化避免生成字符串
            tokenOffset = editor.Document.PositionToOffset(
                new CodeEditor.TextLocation(tokenStartColumn, this.LineNumber));
            let tokenText = editor.Document.GetText(tokenOffset, tokenEndColumn - tokenStartColumn);

            // add to paragraph
            pb.pushStyle(editor.Theme.GetTokenStyle(CodeEditor.CodeToken.GetTokenType(token)));
            pb.addText(tokenText);
            pb.pop();

            if (tokenEndColumn >= endIndex) break;
        }
    }

    private BuildParagraphByFoldings(pb: PixUI.ParagraphBuilder, editor: CodeEditor.TextEditor) {
        // there can't be a folding witch starts in an above line and ends here,
        // because the line is a new one, there must be a return before this line.

        let line = this.LineNumber;
        let column = -1;
        let lineChars = 0; //used for calc fold offset in line
        let preFold: Nullable<CodeEditor.FoldMarker> = null;

        while (true) {
            let starts = editor.Document.FoldingManager.GetFoldedFoldingsWithStartAfterColumn(line, column);
            if (starts.length <= 0) {
                if (line == this.LineNumber) {
                    //current line has no fold
                    this.BuildParagraphByTokens(pb, editor, 0, CodeEditor.TextLocation.MaxColumn);
                } else {
                    //has no fold follow
                    let endLine = editor.Document.GetLineSegment(preFold!.EndLine);
                    endLine.BuildParagraphByTokens(pb, editor, preFold!.EndColumn, CodeEditor.TextLocation.MaxColumn);
                }

                break;
            }

            //search the first starting folding
            let firstFolding = starts[0];
            for (const fm of starts) {
                if (fm.StartColumn < firstFolding.StartColumn)
                    firstFolding = fm;
            }

            starts.Clear();

            if (line == this.LineNumber) {
                if (firstFolding.StartColumn > 0) {
                    //eg: if (xxx) {
                    //             -> fold start here
                    this.BuildParagraphByTokens(pb, editor, 0, firstFolding.StartColumn);
                    lineChars += firstFolding.StartColumn;
                }
            } else {
                //eg: if (xxx) {...} else {...}
                //             <---> preFold here
                let endLine = editor.Document.GetLineSegment(preFold!.EndLine);
                endLine.BuildParagraphByTokens(pb, editor, preFold!.EndColumn, firstFolding.StartColumn);
                lineChars += firstFolding.StartColumn - preFold.EndColumn;
            }

            // add folded text
            pb.pushStyle(editor.Theme.FoldedTextStyle);
            pb.addText(firstFolding.FoldText);
            pb.pop();
            this.CachedFolds ??= new System.List<CachedFoldInfo>();
            this.CachedFolds.Add(new CachedFoldInfo(lineChars, firstFolding));
            lineChars += firstFolding.FoldText.length;

            // goto next iterator
            column = firstFolding.EndColumn;
            line = firstFolding.EndLine;
            preFold = firstFolding;
            if (line >= editor.Document.TotalNumberOfLines) {
                break;
            }
        } //end while
    }

    public GetXPos(editor: CodeEditor.TextEditor, line: number, column: number): number {
        let para = this.GetLineParagraph(editor);

        // target line equals this line
        if (line == this.LineNumber) {
            if (column == 0) return 0;

            let columnStart = column - 1;
            if (column > 1 &&
                CodeEditor.TextUtils.IsMultiCodeUnit(editor.Document.GetCharAt(this.Offset + column - 2))) {
                columnStart -= 1;
            }

            let box1 = PixUI.Utils.GetRectForPosition(para, columnStart, PixUI.BoxHeightStyle.Tight, PixUI.BoxWidthStyle.Tight);
            return box1.Rect.Right;
        }

        // target line is folded in this line, eg: if (XXX) {...} else {...}
        let offsetInLine = -1;
        for (const fold of this.CachedFolds!) {
            if (line == fold.FoldMarker.EndLine) {
                offsetInLine = fold.LineEnd + column - fold.FoldMarker.EndColumn;
                break;
            }
        }

        //TODO: find column start for multi code unit
        let box2 = PixUI.Utils.GetRectForPosition(para, offsetInLine - 1, PixUI.BoxHeightStyle.Tight, PixUI.BoxWidthStyle.Tight);
        return box2.Rect.Right;
    }


    public ClearCachedParagraph() {
        this._cachedParagraph?.delete();
        this._cachedParagraph = null;
        this.CachedFolds = null;
    }

    private ClearFoldedLineCache(manager: CodeEditor.LineManager) {
        let thisLine = this.LineNumber;
        let visibleLine = manager.GetVisibleLine(thisLine);
        let logicalLine = manager.GetFirstLogicalLine(visibleLine);
        if (logicalLine != thisLine) {
            manager.GetLineSegment(logicalLine).ClearCachedParagraph();
        }
    }


    public toString(): string {
        if (this.IsDeleted)
            return "[LineSegment: (deleted) Length = " + this.Length + ", TotalLength = " +
                this.TotalLength + ", DelimiterLength = " + this.DelimiterLength + "]";
        return "[LineSegment: LineNumber=" + this.LineNumber + ", Offset = " + this.Offset +
            ", Length = " + this.Length + ", TotalLength = " + this.TotalLength +
            ", DelimiterLength = " + this.DelimiterLength + "]";
    }

    public Init(props: Partial<LineSegment>): LineSegment {
        Object.assign(this, props);
        return this;
    }
}

export class CachedFoldInfo {
    public constructor(lineStart: number, foldMarker: CodeEditor.FoldMarker) {
        this.LineStart = lineStart;
        this.FoldMarker = foldMarker;
    }

    public readonly LineStart: number;
    public readonly FoldMarker: CodeEditor.FoldMarker;

    public get LineEnd(): number {
        return this.LineStart + this.FoldMarker.FoldText.length;
    }
}
