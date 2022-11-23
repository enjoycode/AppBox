import * as CodeEditor from '@/CodeEditor'
import * as System from '@/System'
/// <summary>
/// A list of events that are fired after the line manager has finished working.
/// </summary>
export class DeferredEventList {
    public removedLines: System.List<CodeEditor.LineSegment>;
    public textAnchor: Nullable<System.List<CodeEditor.TextAnchor>>;

    public AddRemovedLine(line: CodeEditor.LineSegment) {
        this.removedLines ??= new System.List<CodeEditor.LineSegment>();
        this.removedLines.Add(line);
    }

    public AddDeletedAnchor(anchor: CodeEditor.TextAnchor) {
        this.textAnchor ??= new System.List<CodeEditor.TextAnchor>();
        this.textAnchor.Add(anchor);
    }

    public RaiseEvents() {
        // removedLines is raised by the LineManager
        if (this.textAnchor == null) return;
        for (const a of this.textAnchor) {
            a.RaiseDeleted();
        }
    }
}
