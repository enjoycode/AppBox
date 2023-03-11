import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'

export class PathGeometry extends LiveCharts.Drawable {
    protected readonly _commands: System.LinkedList<LiveChartsCore.IPathCommand<PixUI.Path>> = new System.LinkedList();

    public get FirstCommand(): Nullable<System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>>> {
        return this._commands.First;
    }

    public get LastCommand(): Nullable<System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>>> {
        return this._commands.Last;
    }

    public get CountCommands(): number {
        return this._commands.length;
    }

    public IsClosed: boolean = false;

    Draw(context: LiveCharts.SkiaDrawingContext) {
        if (this._commands.length == 0) return;

        let toRemoveSegments = new System.List<LiveChartsCore.IPathCommand<PixUI.Path>>();

        let path = new CanvasKit.Path();
        let isValid = true;

        for (const segment of this._commands) {
            segment.IsValid = true;
            segment.Execute(path, this.CurrentTime, this);
            isValid = isValid && segment.IsValid;

            if (segment.IsValid && segment.RemoveOnCompleted) toRemoveSegments.Add(segment);
        }

        for (const segment of toRemoveSegments) {
            this._commands.Remove(segment);
            isValid = false;
        }

        if (this.IsClosed)
            path.close();

        context.Canvas.drawPath(path, context.Paint);

        if (!isValid) this.IsValid = false;
        path.delete();
    }

    public AddLast(command: LiveChartsCore.IPathCommand<PixUI.Path>): System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>> {
        this.IsValid = false;
        return this._commands.AddLast(command);
    }

    public AddFirst(command: LiveChartsCore.IPathCommand<PixUI.Path>): System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>> {
        this.IsValid = false;
        return this._commands.AddFirst(command);
    }

    public AddAfter(node: System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>>, command: LiveChartsCore.IPathCommand<PixUI.Path>): System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>> {
        this.IsValid = false;
        return this._commands.AddAfter(node, command);
    }

    public AddBefore(node: System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>>, command: LiveChartsCore.IPathCommand<PixUI.Path>): System.LinkedListNode<LiveChartsCore.IPathCommand<PixUI.Path>> {
        this.IsValid = false;
        return this._commands.AddBefore(node, command);
    }

    public ContainsCommand(segment: LiveChartsCore.IPathCommand<PixUI.Path>): boolean {
        return this._commands.Contains(segment);
    }

    public RemoveCommand(command: LiveChartsCore.IPathCommand<PixUI.Path>): boolean {
        this.IsValid = false;
        return this._commands.Remove(command);
    }

    // /// <inheritdoc cref="IPathGeometry{TDrawingContext, TPathArgs}.RemoveCommand(LinkedListNode{IPathCommand{TPathArgs}})" />
    // public void RemoveCommand(LinkedListNode<IPathCommand<SKPath>> node)
    // {
    //     IsValid = false;
    //     _commands.Remove(node);
    // }

    public ClearCommands() {
        this._commands.Clear();
    }


    CompleteTransition(...propertyName: Nullable<string[]>) {
        for (const segment of this._commands) {
            segment.CompleteTransition(...propertyName);
        }

        super.CompleteTransition(...propertyName);
    }
}

export class HeatPathShape extends PathGeometry implements LiveChartsCore.IHeatPathShape {
    private readonly _fillProperty: LiveChartsCore.ColorMotionProperty;

    public constructor() {
        super();
        this._fillProperty = this.RegisterMotionProperty(new LiveChartsCore.ColorMotionProperty("FillColor", (LiveChartsCore.LvcColor.Empty).Clone()));
    }

    public get FillColor(): LiveChartsCore.LvcColor {
        return this._fillProperty.GetMovement(this);
    }

    public set FillColor(value: LiveChartsCore.LvcColor) {
        this._fillProperty.SetMovement((value).Clone(), this);
    }

    Draw(context: LiveCharts.SkiaDrawingContext) {
        if (this._commands.length == 0) return;

        let toRemoveSegments = new System.List<LiveChartsCore.IPathCommand<PixUI.Path>>();

        let path = new CanvasKit.Path();
        let isValid = true;

        for (const segment of this._commands) {
            segment.IsValid = true;
            segment.Execute(path, this.CurrentTime, this);
            isValid = isValid && segment.IsValid;

            if (segment.IsValid && segment.RemoveOnCompleted) toRemoveSegments.Add(segment);
        }

        for (const segment of toRemoveSegments) {
            this._commands.Remove(segment);
            isValid = false;
        }

        if (this.IsClosed) path.close();

        let originalColor = context.Paint.getColor();

        let fill = (this.FillColor).Clone();

        if (System.OpInequality(fill, LiveChartsCore.LvcColor.Empty)) {
            context.Paint.setColor(LiveCharts.LiveChartsSkiaSharp.AsSKColor(fill));
            context.Paint.setStyle(CanvasKit.PaintStyle.Fill);
        }

        context.Canvas.drawPath(path, context.Paint);

        if (System.OpInequality(fill, LiveChartsCore.LvcColor.Empty)) {
            context.Paint.setColor(originalColor);
        }

        if (!isValid) this.IsValid = false;
        path.delete();
    }

    CompleteTransition(...propertyName: Nullable<string[]>) {
        for (const item of this._commands) {
            item.CompleteTransition(...propertyName);
        }

        super.CompleteTransition(...propertyName);
    }
}

