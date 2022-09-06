import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 弹出选择列表，仅支持单选
/// </summary>
export class Select<T> extends PixUI.InputBase<PixUI.Widget> {
    public constructor(value: PixUI.State<Nullable<T>>, filterable: boolean = false) {
        super(filterable
            ? new PixUI.EditableText(value.AsStateOfString())
            : new SelectText(value.AsStateOfString()));
        this._selectedValue = value;

        this.SuffixWidget = new PixUI.ExpandIcon(new PixUI.FloatTween(0, 0.5).Animate(this._expandAnimation));

        if (PixUI.IsInterfaceOfIMouseRegion(this._editor)) {
            const mouseRegion = this._editor;
            mouseRegion.MouseRegion.PointerTap.Add(this.OnEditorTap, this);
        }
        if (PixUI.IsInterfaceOfIFocusable(this._editor)) {
            const focusable = this._editor;
            focusable.FocusNode.FocusChanged.Add(this.OnFocusChanged, this);
        }
    }

    private readonly _selectedValue: PixUI.State<Nullable<T>>;
    private readonly _optionBuilder: Nullable<PixUI.ListPopupItemBuilder<T>>;
    private readonly _expandAnimation: PixUI.OptionalAnimationController = new PixUI.OptionalAnimationController();
    private _listPopup: Nullable<PixUI.ListPopup<T>>;
    private _showing: boolean = false;
    private _labelGetter: Nullable<System.Func2<T, string>>;

    public Options: T[] = [];

    public set OptionsAsyncGetter(value: System.Task<T[]>) {
        this.GetOptionsAsync(value);
    }

    public set LabelGetter(value: System.Func2<T, string>) {
        this._labelGetter = value;
    }

    public get Readonly(): Nullable<PixUI.State<boolean>> {
        if (this._editor instanceof PixUI.EditableText) {
            const editableText = this._editor;
            return editableText.Readonly;
        }
        return (<SelectText><unknown>this._editor).Readonly;
    }

    public set Readonly(value: Nullable<PixUI.State<boolean>>) {
        if (this._editor instanceof PixUI.EditableText) {
            const editableText = this._editor;
            editableText.Readonly = value;
        } else (<SelectText><unknown>this._editor).Readonly = value;
    }

    private OnFocusChanged(focused: boolean) {
        if (!focused)
            this.HidePopup();
    }

    private OnEditorTap(e: PixUI.PointerEvent) {
        if (this._showing) this.HidePopup();
        else this.ShowPopup();
    }

    private ShowPopup() {
        if (this._showing || this.Options.length == 0) return;
        this._showing = true;

        let optionBuilder = this._optionBuilder ??
            ((data, index, isHover, isSelected) => {
                let color = PixUI.RxComputed.Make1(
                    isSelected, v => v ? PixUI.Colors.White : PixUI.Colors.Black);
                return new PixUI.Text(PixUI.State.op_Implicit_From(this._labelGetter != null
                    ? this._labelGetter(data)
                    : data?.toString() ?? "")).Init(
                    {TextColor: color});
            });
        this._listPopup =
            new PixUI.ListPopup<T>(this.Overlay!, optionBuilder, this.W + 8, PixUI.Theme.DefaultFontSize + 8);
        this._listPopup.DataSource = new System.List<T>(this.Options);
        //初始化选中的
        if (this._selectedValue.Value != null)
            this._listPopup.InitSelect(this._selectedValue.Value!);
        this._listPopup.OnSelectionChanged = this.OnSelectionChanged.bind(this);
        this._listPopup.Show(this, new PixUI.Offset(-4, 0), PixUI.Popup.DefaultTransitionBuilder);
        this._expandAnimation.Parent = this._listPopup.AnimationController;
    }

    private HidePopup() {
        if (!this._showing) return;
        this._showing = false;

        this._listPopup?.Hide();
        this._listPopup = null;
    }

    private async GetOptionsAsync(builder: System.Task<T[]>) {
        this.Options = await builder;
    }

    private OnSelectionChanged(data: Nullable<T>) {
        this._showing = false;
        this._listPopup = null;
        this._selectedValue.Value = data;
    }

    public Init(props: Partial<Select<T>>): Select<T> {
        Object.assign(this, props);
        return this;
    }
}

export class SelectText extends PixUI.TextBase implements PixUI.IMouseRegion, PixUI.IFocusable {
    private static readonly $meta_PixUI_IMouseRegion = true;
    private static readonly $meta_PixUI_IFocusable = true;

    public constructor(text: PixUI.State<string>) {
        super(text);
        this.MouseRegion = new PixUI.MouseRegion();
        this.FocusNode = new PixUI.FocusNode();
    }

    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    #FocusNode: PixUI.FocusNode;
    public get FocusNode() {
        return this.#FocusNode;
    }

    private set FocusNode(value) {
        this.#FocusNode = value;
    }

    private _readonly: Nullable<PixUI.State<boolean>>;

    public get Readonly(): Nullable<PixUI.State<boolean>> {
        return this._readonly;
    }

    public set Readonly(value: Nullable<PixUI.State<boolean>>) {
        this._readonly = this.Rebind(this._readonly, value, PixUI.BindingOptions.None);
    }

    protected get ForceHeight(): boolean {
        return true;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.BuildParagraph(this.Text.Value, width);

        let fontHeight = (this.FontSize?.Value ?? PixUI.Theme.DefaultFontSize) + 4;
        this.SetSize(width, Math.min(height, fontHeight));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.Text.Value.length == 0) return;
        canvas.drawParagraph(this.CachedParagraph!, 0, 2);
    }

    public Init(props: Partial<SelectText>): SelectText {
        Object.assign(this, props);
        return this;
    }
}
