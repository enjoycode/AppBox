import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class VectorManager<TSegment extends LiveChartsCore.IConsecutivePathSegment & LiveChartsCore.IAnimatable, TDrawingContext extends LiveChartsCore.DrawingContext> {
    private _nextNode: Nullable<System.LinkedListNode<TSegment>>;
    private _currentNode: Nullable<System.LinkedListNode<TSegment>>;

    public constructor(areaGeometry: LiveChartsCore.IVectorGeometry<TSegment, TDrawingContext>) {
        this.AreaGeometry = areaGeometry;
        this._nextNode = areaGeometry.FirstCommand;
    }

    #AreaGeometry: LiveChartsCore.IVectorGeometry<TSegment, TDrawingContext>;
    public get AreaGeometry() {
        return this.#AreaGeometry;
    }

    private set AreaGeometry(value) {
        this.#AreaGeometry = value;
    }

    public AddConsecutiveSegment(segment: TSegment, followsPrevious: boolean) {
        while (
            this._nextNode != null &&
            this._nextNode.Next != null &&
            segment.Id >= this._nextNode.Next.Value.Id) {
            this._nextNode = this._nextNode.Next;
            if (this._nextNode.Previous == null) continue;
            this.AreaGeometry.RemoveCommand(this._nextNode.Previous);
        }

        // at this points "_nextNode" is:
        // the next node after "segment"
        // or it could also be "segment"
        // or null in case there are no more segments.

        if (this._nextNode == null) {
            if (this._currentNode != null && followsPrevious) segment.Follows(this._currentNode.Value);
            this._currentNode = this.AreaGeometry.AddLast(segment);
            return;
        }

        if (this._nextNode.Value.Id == segment.Id) {
            if (!System.Equals(this._nextNode.Value, segment)) {
                if (followsPrevious) segment.Follows(this._nextNode.Value);
                this._nextNode.Value = segment; // <- ensure it is the same instance
            }
            this._currentNode = this._nextNode;
            this._nextNode = this._currentNode.Next;
            return;
        }

        if (this._currentNode == null) this._currentNode = this._nextNode;

        if (followsPrevious) segment.Follows(this._currentNode.Value);
        this._currentNode = this.AreaGeometry.AddBefore(this._nextNode, segment);
        this._nextNode = this._currentNode.Next;
    }

    public Clear() {
        this.AreaGeometry.ClearCommands();
    }

    public End() {
        while (this._currentNode?.Next != null) {
            this.AreaGeometry.RemoveCommand(this._currentNode.Next);
        }
    }

    public LogPath() {
        let a = "";
        let c = this.AreaGeometry.FirstCommand;

        while (c != null) {
            a += `${c.Value.Id}, `;
            c = c.Next;
        }

        //Trace.WriteLine(a);
    }
}

