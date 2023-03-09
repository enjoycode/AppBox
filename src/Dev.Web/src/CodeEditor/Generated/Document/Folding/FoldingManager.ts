import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class FoldingManager {
    public constructor(document: CodeEditor.Document) {
        this._document = document;
        // _document.DocumentChanged += OnDocumentChanged;
    }

    private readonly _document: CodeEditor.Document;
    private _foldMarker: System.List<CodeEditor.FoldMarker> = new System.List<CodeEditor.FoldMarker>();
    private _foldMarkerByEnd: System.List<CodeEditor.FoldMarker> = new System.List<CodeEditor.FoldMarker>();


    public readonly FoldingsChanged = new System.Event();

    public RaiseFoldingsChanged() {
        this.FoldingsChanged.Invoke();
    }


    // private void OnDocumentChanged(DocumentEventArgs args)
    // {
    //_document.UpdateSegmentsOnDocumentChanged(_foldMarker, args);
    // }

    public IsLineVisible(lineNumber: number): boolean {
        let contains = this.GetFoldingsContainsLineNumber(lineNumber);
        for (const fm of contains) {
            if (fm.IsFolded) return false;
        }

        return true;
    }

    public GetTopLevelFoldedFoldings(): System.List<CodeEditor.FoldMarker> {
        let foldings = new System.List<CodeEditor.FoldMarker>();
        let end = new CodeEditor.TextLocation(0, 0);
        for (const fm of this._foldMarker) {
            if (fm.IsFolded && (fm.StartLine > end.Line ||
                fm.StartLine == end.Line && fm.StartColumn >= end.Column)) {
                foldings.Add(fm);
                end = new CodeEditor.TextLocation(fm.EndColumn, fm.EndLine);
            }
        }

        return foldings;
    }

    public GetFoldingsWithStart(lineNumber: number): System.List<CodeEditor.FoldMarker> {
        return this.GetFoldingsByStartAfterColumn(lineNumber, -1, false);
    }

    public GetFoldingsContainsLineNumber(lineNumber: number): System.List<CodeEditor.FoldMarker> {
        let foldings = new System.List<CodeEditor.FoldMarker>();
        for (const fm of this._foldMarker) {
            if (fm.StartLine < lineNumber && lineNumber < fm.EndLine)
                foldings.Add(fm);
        }

        return foldings;
    }

    public GetFoldingsWithEnd(lineNumber: number): System.List<CodeEditor.FoldMarker> {
        return this.GetFoldingsByEndAfterColumn(lineNumber, 0, false);
    }

    public GetFoldedFoldingsWithStartAfterColumn(lineNumber: number, column: number): System.List<CodeEditor.FoldMarker> {
        return this.GetFoldingsByStartAfterColumn(lineNumber, column, true);
    }

    public GetFoldedFoldingsWithStart(lineNumber: number): System.List<CodeEditor.FoldMarker> {
        return this.GetFoldingsByStartAfterColumn(lineNumber, -1, true);
    }

    public GetFoldedFoldingsWithEnd(lineNumber: number): System.List<CodeEditor.FoldMarker> {
        return this.GetFoldingsByEndAfterColumn(lineNumber, 0, true);
    }

    private GetFoldingsByStartAfterColumn(lineNumber: number, column: number, forceFolded: boolean): System.List<CodeEditor.FoldMarker> {
        let foldings = new System.List<CodeEditor.FoldMarker>();

        //TODO: check web's BinarySearch
        let pattern = new CodeEditor.FoldMarker(this._document, lineNumber, column, lineNumber, column,
            CodeEditor.FoldType.Unspecified, "", false);
        let index = this._foldMarker.BinarySearch(pattern, StartComparer.Instance);
        if (index < 0) index = ~index;

        for (; index < this._foldMarker.length; index++) {
            let fm = this._foldMarker[index];
            if (fm.StartLine < lineNumber || fm.StartLine > lineNumber) break;
            if (fm.StartColumn <= column) continue;
            if (!forceFolded || fm.IsFolded)
                foldings.Add(fm);
        }

        return foldings;
    }

    public GetFoldingsByEndAfterColumn(lineNumber: number, column: number,
                                       forceFolded: boolean): System.List<CodeEditor.FoldMarker> {
        let foldings = new System.List<CodeEditor.FoldMarker>();

        let pattern = new CodeEditor.FoldMarker(this._document, lineNumber, column, lineNumber, column,
            CodeEditor.FoldType.Unspecified, "", false);
        let index = this._foldMarkerByEnd.BinarySearch(pattern, EndComparer.Instance);
        if (index < 0) index = ~index;

        for (; index < this._foldMarkerByEnd.length; index++) {
            let fm = this._foldMarkerByEnd[index];
            if (fm.EndLine < lineNumber || fm.EndLine > lineNumber) break;
            if (fm.EndColumn <= column) continue;
            if (!forceFolded || fm.IsFolded)
                foldings.Add(fm);
        }

        return foldings;
    }

    public UpdateFoldings(newFoldings: Nullable<System.List<CodeEditor.FoldMarker>>) {
        // final int oldFoldingCount = foldMarker.length;
        if (newFoldings != null && newFoldings.length != 0) {
            newFoldings.Sort((a, b) => a.CompareTo(b));
            if (this._foldMarker.length == newFoldings.length) {
                for (let i = 0; i < this._foldMarker.length; ++i) {
                    newFoldings[i].IsFolded = this._foldMarker[i].IsFolded;
                }

                this._foldMarker = newFoldings;
            } else {
                for (let i: number = 0, j: number = 0; i < this._foldMarker.length && j < newFoldings.length;) {
                    let n = newFoldings[j].CompareTo(this._foldMarker[i]);
                    if (n > 0) {
                        ++i;
                    } else {
                        if (n == 0) {
                            newFoldings[j].IsFolded = this._foldMarker[i].IsFolded;
                        }

                        ++j;
                    }
                }
            }
        }

        if (newFoldings != null) {
            this._foldMarker = newFoldings;
            this._foldMarkerByEnd = new System.List<CodeEditor.FoldMarker>(newFoldings);
            this._foldMarkerByEnd.Sort((a, b) => EndComparer.Instance.Compare(a, b));
        } else {
            this._foldMarker.Clear();
            this._foldMarkerByEnd.Clear();
        }

        //TODO:暂激发foldingsChanged
        this.FoldingsChanged.Invoke();
    }
}

export class StartComparer implements System.IComparer<CodeEditor.FoldMarker> {
    private static readonly $meta_System_IComparer = true;
    public static readonly Instance: StartComparer = new StartComparer();

    public Compare(x: CodeEditor.FoldMarker, y: CodeEditor.FoldMarker): number {
        if (x.StartLine < y.StartLine) return -1;
        return x.StartLine == y.StartLine ? x.StartColumn.CompareTo(y.StartColumn) : 1;
    }
}

export class EndComparer implements System.IComparer<CodeEditor.FoldMarker> {
    private static readonly $meta_System_IComparer = true;
    public static readonly Instance: EndComparer = new EndComparer();

    public Compare(x: CodeEditor.FoldMarker, y: CodeEditor.FoldMarker): number {
        if (x.EndLine < y.EndLine) return -1;
        return x.EndLine == y.EndLine ? x.EndColumn.CompareTo(y.EndColumn) : 1;
    }
}
