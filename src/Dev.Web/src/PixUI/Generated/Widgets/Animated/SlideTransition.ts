import * as PixUI from '@/PixUI'

export class SlideTransition extends PixUI.Transform {
    private readonly _position: PixUI.Animation<PixUI.Offset>;
    private _offsetX: number = 0;
    private _offsetY: number = 0;

    public constructor(position: PixUI.Animation<PixUI.Offset>) {
        super(PixUI.Matrix4.CreateIdentity());
        this._position = position;
        this._position.ValueChanged.Add(this.OnPositionChanged, this);
    }

    Layout(availableWidth: number, availableHeight: number) {
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

    Dispose() {
        this._position.ValueChanged.Remove(this.OnPositionChanged, this);
        super.Dispose();
    }
}
