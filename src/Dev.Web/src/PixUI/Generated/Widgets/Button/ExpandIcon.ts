import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class ExpandIcon extends PixUI.SingleChildWidget implements PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IMouseRegion = true;
    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    public set OnPointerDown(value: System.Action1<PixUI.PointerEvent>) {
        this.MouseRegion.PointerDown.Add(value, this);
    }

    public constructor(turns: PixUI.Animation<number>, size: Nullable<PixUI.State<number>> = null, color: Nullable<PixUI.State<PixUI.Color>> = null) {
        super();
        this.MouseRegion = new PixUI.MouseRegion();

        this.Child = new PixUI.RotationTransition(turns).Init({
            Child: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.ExpandMore)).Init({
                    Size: size,
                    Color: color
                }
            )
        });
    }

    public Init(props: Partial<ExpandIcon>): ExpandIcon {
        Object.assign(this, props);
        return this;
    }
}
