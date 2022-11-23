import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridCheckboxColumn<T> extends PixUI.DataGridHostColumn<T> {
    public constructor(label: string, cellValueGetter: System.Func2<T, boolean>, cellValueSetter: Nullable<System.Action2<T, boolean>> = null) {
        super(label, (data, _) => {
            let state = new PixUI.RxProperty<boolean>(() => cellValueGetter(data), cellValueSetter == null ? null : v => cellValueSetter(data, v));
            return new PixUI.Checkbox(state);
        });
    }
}
