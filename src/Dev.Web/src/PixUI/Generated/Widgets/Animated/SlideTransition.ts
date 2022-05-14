import * as PixUI from '@/PixUI'
/// <summary>
/// Animates the position of a widget relative to its normal position.
/// </summary>
/// <remarks>
/// The translation is expressed as an Offset scaled to the child's size.
/// For example, an Offset with a dx of 0.25 will result in a horizontal
/// translation of one quarter the width of the child.
///
/// By default, the offsets are applied in the coordinate system of the canvas
/// (so positive x offsets move the child towards the right).
/// </remarks>
export class SlideTransition extends PixUI.Transform {
    private readonly _position: PixUI.Animation<PixUI.Offset>;
    private _offsetX: number = 0;
    private _offsetY: number = 0;

    public constructor(position: PixUI.Animation<PixUI.Offset>) {
        super(PixUI.Matrix4.CreateIdentity());
        this._position = position;
        this._position.ValueChanged.Add(this.OnPositionChanged, this);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        super.Layout(availableWidth, availableHeight);
        //根据子组件大小计算并初始化偏移量
        this.CalcOffset();
        this.InitTransformAndOrigin(PixUI.Matrix4.CreateTranslation(this._offsetX, this._offsetY, 0));
    }

    private CalcOffset() {
        if (this.Child == null) return;

        this._offsetX = this._position.Value.Dx * this.Child.W;
        this._offsetY = this._position.Value.Dy * this.Child.H;
    }

    private OnPositionChanged() {
        this.CalcOffset();
        this.SetTransform(PixUI.Matrix4.CreateTranslation(this._offsetX, this._offsetY, 0));
    }

    public Dispose() {
        this._position.ValueChanged.Remove(this.OnPositionChanged, this);
        super.Dispose();
    }

    public Init(props: Partial<SlideTransition>): SlideTransition {
        Object.assign(this, props);
        return this;
    }
}
