import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class IfConditional extends PixUI.Conditional<boolean> {
    public constructor(state: PixUI.State<boolean>, trueBuilder: System.Func1<PixUI.Widget>, falseBuilder: Nullable<System.Func1<PixUI.Widget>>) {
        super(state, falseBuilder == null
            ? [new PixUI.WhenBuilder<boolean>(v => v, trueBuilder),]
            :
            [
                new PixUI.WhenBuilder<boolean>(v => v, trueBuilder),
                new PixUI.WhenBuilder<boolean>(v => !v, falseBuilder)
            ]
        );
    }

    public Init(props: Partial<IfConditional>): IfConditional {
        Object.assign(this, props);
        return this;
    }
}
