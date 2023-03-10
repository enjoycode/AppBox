import * as PixUI from '@/PixUI'

export class RotationTransition extends PixUI.Transform {
    private readonly _turns: PixUI.Animation<number>;

    public constructor(turns: PixUI.Animation<number>) {
        super(PixUI.Matrix4.CreateIdentity());
        this._turns = turns;
        this._turns.ValueChanged.Add(this.OnTurnChanged, this);
    }

    Layout(availableWidth: number, availableHeight: number) {
        super.Layout(availableWidth, availableHeight);
        //根据子组件大小计算并初始化偏移量
        let originX = 0;
        let originY = 0;
        if (this.Child != null) {
            //TODO: 暂直接中心点
            originX = this.Child.W / 2;
            originY = this.Child.H / 2;
        }

        this.InitTransformAndOrigin(this.CalcTransform(), new PixUI.Offset(originX, originY));
    }

    private CalcTransform(): PixUI.Matrix4 {
        let matrix = PixUI.Matrix4.CreateIdentity();
        matrix.RotateZ(<number><unknown>(this._turns.Value * Math.PI * 2.0));
        return matrix;
    }

    private OnTurnChanged() {
        this.SetTransform(this.CalcTransform());
    }

    Dispose() {
        this._turns.ValueChanged.Remove(this.OnTurnChanged, this);
        super.Dispose();
    }
}
