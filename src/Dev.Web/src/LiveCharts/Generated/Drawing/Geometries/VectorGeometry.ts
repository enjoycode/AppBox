import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class VectorGeometry<TSegment extends object & LiveChartsCore.IAnimatable & LiveChartsCore.IConsecutivePathSegment> extends LiveCharts.Drawable implements LiveChartsCore.IVectorGeometry<TSegment, LiveCharts.SkiaDrawingContext> {
    private readonly _pivotProperty: LiveChartsCore.FloatMotionProperty;

    public constructor() {
        super();
        this._pivotProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Pivot", 0));
    }

    #Commands: System.LinkedList<TSegment> = new System.LinkedList();
    protected get Commands() {
        return this.#Commands;
    }

    private set Commands(value) {
        this.#Commands = value;
    }

    public get FirstCommand(): Nullable<System.LinkedListNode<TSegment>> {
        return this.Commands.First;
    }

    public get LastCommand(): Nullable<System.LinkedListNode<TSegment>> {
        return this.Commands.Last;
    }

    public get CountCommands(): number {
        return this.Commands.length;
    }

    public ClosingMethod: LiveChartsCore.VectorClosingMethod = 0;

    public get Pivot(): number {
        return this._pivotProperty.GetMovement(this);
    }

    public set Pivot(value: number) {
        this._pivotProperty.SetMovement(value, this);
    }

    public AddLast(command: TSegment): System.LinkedListNode<TSegment> {
        this.IsValid = false;
        return this.Commands.AddLast(command);
    }

    public AddFirst(command: TSegment): System.LinkedListNode<TSegment> {
        this.IsValid = false;
        return this.Commands.AddFirst(command);
    }

    public AddAfter(node: System.LinkedListNode<TSegment>, command: TSegment): System.LinkedListNode<TSegment> {
        this.IsValid = false;
        return this.Commands.AddAfter(node, command);
    }

    public AddBefore(node: System.LinkedListNode<TSegment>, command: TSegment): System.LinkedListNode<TSegment> {
        this.IsValid = false;
        return this.Commands.AddBefore(node, command);
    }

    public ContainsCommand(segment: TSegment): boolean {
        return this.Commands.Contains(segment);
    }

    // /// <inheritdoc cref="IVectorGeometry{TSegment, TDrawingContext}.RemoveCommand(TSegment)" />
    // public bool RemoveCommand(TSegment command)
    // {
    //     IsValid = false;
    //     return Commands.Remove(command);
    // }

    public RemoveCommand(node: System.LinkedListNode<TSegment>) {
        this.IsValid = false;
        this.Commands.Remove(node);
    }

    public ClearCommands() {
        this.IsValid = false;
        this.Commands.Clear();
    }

    CompleteTransition(...propertyName: Nullable<string[]>) {
        for (const segment of this.Commands) {
            segment.CompleteTransition(...propertyName);
        }

        super.CompleteTransition(...propertyName);
    }

    Draw(context: LiveCharts.SkiaDrawingContext) {
        if (this.Commands.length == 0) return;

        let toRemoveSegments = new System.List<TSegment>();

        let path = new CanvasKit.Path();
        let isValid = true;

        let currentTime = this.CurrentTime;
        let isFirst = true;
        let last: Nullable<TSegment> = null;

        for (const segment of this.Commands) {
            segment.IsValid = true;
            segment.CurrentTime = currentTime;

            if (isFirst) {
                isFirst = false;
                this.OnOpen(context, path, segment);
            }

            this.OnDrawSegment(context, path, segment);
            isValid = isValid && segment.IsValid;

            if (segment.IsValid && segment.RemoveOnCompleted) toRemoveSegments.Add(segment);
            last = segment;
        }

        for (const segment of toRemoveSegments) {
            this.Commands.Remove(segment);
            isValid = false;
        }

        if (last != null) this.OnClose(context, path, last);

        context.Canvas.drawPath(path, context.Paint);

        if (!isValid) this.IsValid = false;
        path.delete();
    }

    protected OnOpen(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: TSegment) {
    }

    protected OnClose(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: TSegment) {
    }

    protected OnDrawSegment(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: TSegment) {
    }
}
