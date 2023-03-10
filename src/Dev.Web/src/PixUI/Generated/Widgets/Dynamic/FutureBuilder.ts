import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class FutureBuilder<T> extends PixUI.DynamicView {
    public constructor(future: System.Task<T>,
                       doneBuilder: System.Func3<Nullable<T>, Nullable<System.Exception>, Nullable<PixUI.Widget>>,
                       runningBuilder: Nullable<System.Func1<PixUI.Widget>> = null) {
        super();
        this._future = future;
        this._doneBuilder = doneBuilder;

        if (runningBuilder != null)
            this.ReplaceTo(runningBuilder());
    }

    private readonly _future: System.Task<T>;
    private readonly _doneBuilder: System.Func3<Nullable<T>, Nullable<System.Exception>, Nullable<PixUI.Widget>>;

    OnMounted() {
        super.OnMounted();

        if (!this.HasLayout)
            this.Run();
    }

    private async Run() {
        try {
            let res = await this._future;
            // @ts-ignore
            this.ReplaceTo(this._doneBuilder(res, null));
        } catch (ex: any) {
            let nullValue: any = null; //Don't use default(T) for web
            this.ReplaceTo(this._doneBuilder(<Nullable<T>><unknown>nullValue, ex));
        }
    }

}

