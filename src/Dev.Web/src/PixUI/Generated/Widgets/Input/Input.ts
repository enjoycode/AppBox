import * as PixUI from '@/PixUI'

export class Input extends PixUI.InputBase<PixUI.EditableText> {
    public constructor(text: PixUI.State<string>) {
        super(new PixUI.EditableText(text));
        this.Readonly = PixUI.State.op_Implicit_From(text.Readonly);
    }

    public get FontSize(): Nullable<PixUI.State<number>> {
        return this._editor.FontSize;
    }

    public set FontSize(value: Nullable<PixUI.State<number>>) {
        this._editor.FontSize = value;
    }

    public set Prefix(value: Nullable<PixUI.Widget>) {
        this.PrefixWidget = value;
    }

    public set Suffix(value: Nullable<PixUI.Widget>) {
        this.SuffixWidget = value;
    }

    public get Readonly(): Nullable<PixUI.State<boolean>> {
        return this._editor.Readonly;
    }

    public set Readonly(value: Nullable<PixUI.State<boolean>>) {
        this._editor.Readonly = value;
    }

    public set IsObscure(value: boolean) {
        this._editor.IsObscure = value;
    }

    public set HintText(value: string) {
        this._editor.HintText = value;
    }
}
