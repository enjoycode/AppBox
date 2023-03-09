import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class LineManager {
    public constructor(document: CodeEditor.Document) {
        this._document = document;
        this._lineCollection = new CodeEditor.LineSegmentTree();
    }

    private readonly _document: CodeEditor.Document;
    private readonly _lineCollection: CodeEditor.LineSegmentTree;

    public get TotalNumberOfLines(): number {
        return this._lineCollection.Count;
    }


    public readonly LineLengthChanged = new System.Event<CodeEditor.LineLengthChangeEventArgs>();
    public readonly LineCountChanged = new System.Event<CodeEditor.LineCountChangeEventArgs>();
    public readonly LineDeleted = new System.Event<CodeEditor.LineEventArgs>();


    public GetLineNumberForOffset(offset: number): number {
        return this.GetLineSegmentForOffset(offset).LineNumber;
    }

    public GetLineSegmentForOffset(offset: number): CodeEditor.LineSegment {
        return this._lineCollection.GetByOffset(offset);
    }

    public GetLineSegment(lineNumber: number): CodeEditor.LineSegment {
        return this._lineCollection.GetNode(lineNumber).Value.LineSegment;
    }

    public GetFirstLogicalLine(visibleLineNumber: number): number {
        if (!this._document.TextEditorOptions.EnableFolding)
            return visibleLineNumber;

        let v = 0;
        let foldEnd = 0;
        let foldings = this._document.FoldingManager.GetTopLevelFoldedFoldings();
        for (const fm of foldings) {
            if (fm.StartLine >= foldEnd) {
                if (v + fm.StartLine - foldEnd >= visibleLineNumber)
                    break;

                v += fm.StartLine - foldEnd;
                foldEnd = fm.EndLine;
            }
        }

        foldings.Clear();

        return foldEnd + visibleLineNumber - v;
    }

    public GetVisibleLine(logicalLineNumber: number): number {
        if (!this._document.TextEditorOptions.EnableFolding)
            return logicalLineNumber;

        let visibleLine = 0;
        let foldEnd = 0;
        let foldings = this._document.FoldingManager.GetTopLevelFoldedFoldings();
        for (const fm of foldings) {
            if (fm.StartLine >= logicalLineNumber)
                break;

            if (fm.StartLine >= foldEnd) {
                visibleLine += fm.StartLine - foldEnd;
                if (fm.EndLine > logicalLineNumber)
                    return visibleLine;

                foldEnd = fm.EndLine;
            }
        }

        foldings.Clear();

        // Debug.Assert(logicalLineNumber >= foldEnd);
        visibleLine += logicalLineNumber - foldEnd;
        return visibleLine;
    }

    public SetContent(text: string) {
        this._lineCollection.Clear();
        if (!System.IsNullOrEmpty(text)) {
            this.Replace(0, 0, text);
        }
    }

    public Insert(offset: number, text: string) {
        this.Replace(offset, 0, text);
    }

    public Remove(offset: number, length: number) {
        this.Replace(offset, length, "");
    }

    public Replace(offset: number, length: number, text: string) {
        let lineStart = this.GetLineNumberForOffset(offset);
        let oldNumberOfLines = this.TotalNumberOfLines;
        let deferredEventList = new CodeEditor.DeferredEventList();
        this.RemoveInternal(deferredEventList, offset, length);
        // var numberOfLinesAfterRemoving = TotalNumberOfLines;
        if (!System.IsNullOrEmpty(text)) {
            this.InsertInternal(offset, text);
        }

        //TODO:
        // Only fire events after RemoveInternal+InsertInternal finished completely:
        // Otherwise we would expose inconsistent state to the event handlers.
        // if (deferredEventList.removedLines != null) {
        //   foreach (LineSegment ls in deferredEventList.removedLines)
        //   OnLineDeleted(new LineEventArgs(document, ls));
        // }
        //deferredEventList.RaiseEvents();

        if (this.TotalNumberOfLines != oldNumberOfLines) {
            this.LineCountChanged.Invoke(new CodeEditor.LineCountChangeEventArgs(this._document, lineStart,
                this.TotalNumberOfLines - oldNumberOfLines));
        }
    }

    private InsertInternal(offset: number, text: string) {
        let segment = this._lineCollection.GetByOffset(offset);
        let ds = LineManager.NextDelimiter(text, 0);
        if (ds == null) {
            // no newline is being inserted, all text is inserted in a single line
            segment.InsertedLinePart(this, offset - segment.Offset, text.length);
            this.SetSegmentLength(segment, segment.TotalLength + text.length);
            return;
        }

        let firstLine = segment;
        firstLine.InsertedLinePart(this, offset - firstLine.Offset, ds.Offset);
        let lastDelimiterEnd = 0;
        while (ds != null) {
            // split line segment at line delimiter
            let lineBreakOffset = offset + ds.Offset + ds.Length;
            let segmentOffset = segment.Offset;
            let lengthAfterInsertionPos = segmentOffset + segment.TotalLength - (offset + lastDelimiterEnd);
            this._lineCollection.SetSegmentLength(segment, lineBreakOffset - segmentOffset);
            let newSegment = this._lineCollection.InsertSegmentAfter(segment, lengthAfterInsertionPos);
            segment.DelimiterLength = ds.Length;

            segment = newSegment;
            lastDelimiterEnd = ds.Offset + ds.Length;

            ds = LineManager.NextDelimiter(text, lastDelimiterEnd);
        }

        firstLine.SplitTo(segment);
        // insert rest after last delimiter
        if (lastDelimiterEnd != text.length) {
            segment.InsertedLinePart(this, 0, text.length - lastDelimiterEnd);
            this.SetSegmentLength(
                segment, segment.TotalLength + text.length - lastDelimiterEnd);
        }
    }

    private RemoveInternal(deferredEventList: CodeEditor.DeferredEventList, offset: number, length: number) {
        // Debug.Assert(length >= 0);
        if (length == 0) return;

        let it = this._lineCollection.GetEnumeratorForOffset(offset);
        let startSegment: CodeEditor.LineSegment = it.Current;
        let startSegmentOffset: number = startSegment.Offset;
        if (offset + length < startSegmentOffset + startSegment.TotalLength) {
            // just removing a part of this line segment
            startSegment.RemovedLinePart(
                this, deferredEventList, offset - startSegmentOffset, length);
            this.SetSegmentLength(startSegment, startSegment.TotalLength - length);
            return;
        }

        // merge startSegment with another line segment because startSegment's delimiter was deleted
        // possibly remove lines in between if multiple delimiters were deleted
        let charactersRemovedInStartLine: number = startSegmentOffset + startSegment.TotalLength - offset;
        //Debug.Assert(charactersRemovedInStartLine > 0);
        startSegment.RemovedLinePart(this, deferredEventList,
            offset - startSegmentOffset, charactersRemovedInStartLine);

        let endSegment: CodeEditor.LineSegment = this._lineCollection.GetByOffset(offset + length);
        if (endSegment == startSegment) {
            // special case: we are removing a part of the last line up to the
            // end of the document
            this.SetSegmentLength(startSegment, startSegment.TotalLength - length);
            return;
        }

        let endSegmentOffset = endSegment.Offset;
        let charactersLeftInEndLine = endSegmentOffset + endSegment.TotalLength - (offset + length);
        endSegment.RemovedLinePart(this, deferredEventList, 0,
            endSegment.TotalLength - charactersLeftInEndLine);
        startSegment.MergedWith(endSegment, offset - startSegmentOffset);
        this.SetSegmentLength(
            startSegment,
            startSegment.TotalLength -
            charactersRemovedInStartLine +
            charactersLeftInEndLine);
        startSegment.DelimiterLength = endSegment.DelimiterLength;
        // remove all segments between startSegment (excl.) and endSegment (incl.)
        it.MoveNext();
        let segmentToRemove: CodeEditor.LineSegment;
        do {
            segmentToRemove = it.Current;
            it.MoveNext();
            this._lineCollection.RemoveSegment(segmentToRemove);
            segmentToRemove.Deleted(deferredEventList);
        } while (segmentToRemove != endSegment);
    }

    private SetSegmentLength(segment: CodeEditor.LineSegment, newTotalLength: number) {
        let delta = newTotalLength - segment.TotalLength;
        if (delta == 0) return;

        this._lineCollection.SetSegmentLength(segment, newTotalLength);
        this.LineLengthChanged.Invoke(new CodeEditor.LineLengthChangeEventArgs(this._document, segment, delta));
    }

    private static NextDelimiter(text: string, offset: number): Nullable<DelimiterSegment> {
        for (let i = offset; i < text.length; i++) {
            switch (text.charCodeAt(i)) {
                case 13:
                    if (i + 1 < text.length && text.charCodeAt(i + 1) == 10)
                        return new DelimiterSegment(i, 2);
                    else
                        return new DelimiterSegment(i, 1);
                case 10:
                    return new DelimiterSegment(i, 1);
            }
        }

        return null;
    }
}

export class DelimiterSegment {
    public readonly Offset: number;
    public readonly Length: number;

    public constructor(offset: number, length: number) {
        this.Offset = offset;
        this.Length = length;
    }
}
