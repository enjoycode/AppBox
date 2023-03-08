import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IVectorGeometry<TSegment extends LiveChartsCore.IConsecutivePathSegment, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IDrawable<TDrawingContext> {
    get ClosingMethod(): LiveChartsCore.VectorClosingMethod;

    set ClosingMethod(value: LiveChartsCore.VectorClosingMethod);

    get Pivot(): number;

    set Pivot(value: number);

    get FirstCommand(): Nullable<System.LinkedListNode<TSegment>>;


    get LastCommand(): Nullable<System.LinkedListNode<TSegment>>;


    get CountCommands(): number;


    AddLast(command: TSegment): System.LinkedListNode<TSegment>;

    AddFirst(command: TSegment): System.LinkedListNode<TSegment>;

    AddAfter(node: System.LinkedListNode<TSegment>, command: TSegment): System.LinkedListNode<TSegment>;

    AddBefore(node: System.LinkedListNode<TSegment>, command: TSegment): System.LinkedListNode<TSegment>;

    RemoveCommand(command: TSegment): boolean;

    RemoveCommand(node: System.LinkedListNode<TSegment>): void;

    ContainsCommand(command: TSegment): boolean;

    ClearCommands(): void;
}
