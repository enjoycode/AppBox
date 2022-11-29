import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class IfConditional extends PixUI.Conditional<boolean> {
    public constructor(state: PixUI.State<boolean>, trueBuilder: System.Func1<PixUI.Widget>,
                       falseBuilder: Nullable<System.Func1<PixUI.Widget>> = null) {
        super(state);
        this.When(v => v, trueBuilder);
        if (falseBuilder != null)
            this.When(v => !v, falseBuilder);
    }
}
