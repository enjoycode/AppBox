import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SKMatrixMotionProperty extends LiveChartsCore.MotionProperty<PixUI.Matrix4> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="SKMatrixMotionProperty"/> class.
    // /// </summary>
    // /// <param name="propertyName">The property name.</param>
    // public SKMatrixMotionProperty(string propertyName)
    //     : base(propertyName) { }

    public constructor(propertyName: string, matrix: PixUI.Matrix4) {
        super(propertyName);
        this.fromValue = (matrix).Clone();
        this.toValue = (matrix).Clone();
    }

    OnGetMovement(progress: number): PixUI.Matrix4 {
        return new PixUI.Matrix4(this.fromValue.M0 + progress * (this.toValue.M0 - this.fromValue.M0),
            this.fromValue.M1 + progress * (this.toValue.M1 - this.fromValue.M1),
            this.fromValue.M2 + progress * (this.toValue.M2 - this.fromValue.M2),
            this.fromValue.M3 + progress * (this.toValue.M3 - this.fromValue.M3),

            this.fromValue.M4 + progress * (this.toValue.M4 - this.fromValue.M4),
            this.fromValue.M5 + progress * (this.toValue.M5 - this.fromValue.M5),
            this.fromValue.M6 + progress * (this.toValue.M6 - this.fromValue.M6),
            this.fromValue.M7 + progress * (this.toValue.M7 - this.fromValue.M7),

            this.fromValue.M8 + progress * (this.toValue.M8 - this.fromValue.M8),
            this.fromValue.M9 + progress * (this.toValue.M9 - this.fromValue.M9),
            this.fromValue.M10 + progress * (this.toValue.M10 - this.fromValue.M10),
            this.fromValue.M11 + progress * (this.toValue.M11 - this.fromValue.M11),

            this.fromValue.M12 + progress * (this.toValue.M12 - this.fromValue.M12),
            this.fromValue.M13 + progress * (this.toValue.M13 - this.fromValue.M13),
            this.fromValue.M14 + progress * (this.toValue.M14 - this.fromValue.M14),
            this.fromValue.M15 + progress * (this.toValue.M15 - this.fromValue.M15)
        );
    }
}