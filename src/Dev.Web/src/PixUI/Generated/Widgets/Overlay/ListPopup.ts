import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class ItemState {
    public readonly HoverState: PixUI.State<boolean>;
    public readonly SelectedState: PixUI.State<boolean>;

    public constructor(hoverState: PixUI.State<boolean>, selectedState: PixUI.State<boolean>) {
        this.HoverState = hoverState;
        this.SelectedState = selectedState;
    }
}

export class ListPopupItemWidget extends PixUI.SingleChildWidget implements PixUI.IMouseRegion {
    private static readonly $meta_PixUI_IMouseRegion = true;
    private readonly _hoverState: PixUI.State<boolean>;
    private readonly _selectedState: PixUI.State<boolean>;

    public constructor(index: number, hoverState: PixUI.State<boolean>, selectedState: PixUI.State<boolean>, onSelect: System.Action1<number>) {
        super();
        this._hoverState = this.Bind(hoverState);
        this._selectedState = selectedState;

        this.MouseRegion = new PixUI.MouseRegion(() => PixUI.Cursors.Hand);
        this.MouseRegion.HoverChanged.Add(isHover => hoverState.Value = isHover);
        this.MouseRegion.PointerTap.Add(e => onSelect(index));
    }

    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //始终为上级指定的宽高
        let fixedWidth = this.Width!.Value;
        let fixedHeight = this.Height!.Value;
        this.Child?.Layout(fixedWidth, fixedHeight);
        this.SetSize(fixedWidth, fixedHeight);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._selectedState.Value)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(PixUI.Theme.FocusedColor));
        else if (this._hoverState.Value)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(PixUI.Theme.AccentColor));

        super.Paint(canvas, area);
    }

    public Init(props: Partial<ListPopupItemWidget>): ListPopupItemWidget {
        Object.assign(this, props);
        return this;
    }
}

/// <summary>
/// 列表弹窗，可通过键盘或鼠标选择指定项，并且支持条件过滤
/// </summary>
export class ListPopup<T> extends PixUI.Popup {
    public constructor(overlay: PixUI.Overlay, itemBuilder: System.Func5<T, number, PixUI.State<boolean>, PixUI.State<boolean>, PixUI.Widget>, popupWidth: number, itemExtent: number, maxShowItems: number = 5) {
        super(overlay);
        this._itemExtent = itemExtent;
        this._maxShowItems = maxShowItems;
        this._itemBuilder = itemBuilder;
        this._listViewController = new PixUI.ListViewController<T>();
        this._child = new PixUI.Card().Init(
            {
                Width: PixUI.State.op_Implicit_From(popupWidth),
                Elevation: PixUI.State.op_Implicit_From(8),
                Child: new PixUI.ListView<T>(this.BuildItem.bind(this), null, this._listViewController)
            });
        this._child.Parent = this;
    }

    private readonly _listViewController: PixUI.ListViewController<T>;
    private readonly _itemBuilder: System.Func5<T, number, PixUI.State<boolean>, PixUI.State<boolean>, PixUI.Widget>;
    private readonly _child: PixUI.Card;
    private readonly _maxShowItems: number; //最多可显示多少个
    private readonly _itemExtent: number;
    private _itemStates: Nullable<ItemState[]>;

    private _selectedIndex: number = -1;
    private _fullDataSource: Nullable<System.IList<T>>;

    public get DataSource(): Nullable<System.IList<T>> {
        return this._listViewController.DataSource;
    }

    public set DataSource(value: Nullable<System.IList<T>>) {
        this._fullDataSource = value; //reset it
        this.ChangeDataSource(value);
    }

    public OnSelectionChanged: Nullable<System.Action1<Nullable<T>>>;

    private ChangeDataSource(value: Nullable<System.IList<T>>) {
        if (value != null) {
            this._itemStates = [];
            for (let i = 0; i < value.length; i++) {
                this._itemStates[i] = new ItemState(PixUI.State.op_Implicit_From(false), PixUI.State.op_Implicit_From(false));
            }
        }

        this._selectedIndex = -1; //reset it
        this._listViewController.DataSource = value;
    }

    private BuildItem(data: T, index: number): PixUI.Widget {
        let states = this._itemStates![index];

        return new ListPopupItemWidget(index, states.HoverState, states.SelectedState, this.OnSelectByTap.bind(this)).Init(
            {
                Width: this._child.Width, Height: PixUI.State.op_Implicit_From(this._itemExtent),
                Child: this._itemBuilder(data, index, states.HoverState, states.SelectedState)
            });
    }

    public TrySelectFirst() {
        if (this._listViewController.DataSource != null && this._listViewController.DataSource.length > 0) {
            this.Select(0, false);
            this._listViewController.ScrollController.OffsetY = 0;
        }
    }

    private Select(index: number, raiseChangedEvent: boolean = false) {
        if (this._selectedIndex == index) return;

        if (this._selectedIndex >= 0)
            this._itemStates![this._selectedIndex].SelectedState.Value = false;

        this._selectedIndex = index;
        this._itemStates![this._selectedIndex].SelectedState.Value = true;

        if (raiseChangedEvent)
            this.OnSelectionChanged?.call(this, this.DataSource![index]);

        this.Invalidate(PixUI.InvalidAction.Repaint); //force repaint
    }

    public UpdateFilter(predicate: System.Predicate<T>) {
        this.Invalidate(PixUI.InvalidAction.Relayout); //强制自己重新布局
        // @ts-ignore
        this.ChangeDataSource(this._fullDataSource?.Where(t => predicate(t)).ToArray());
    }

    public ClearFilter() {
        this.Invalidate(PixUI.InvalidAction.Relayout); //强制自己重新布局
        this.ChangeDataSource(this._fullDataSource);
    }


    private OnSelectByTap(index: number) {
        this.Select(index, true);
        this.Hide();
    }

    private OnKeysUp() {
        if (this._selectedIndex <= 0) return;
        this.Select(this._selectedIndex - 1, false);
        this._listViewController.ScrollTo(this._selectedIndex);
    }

    private OnKeysDown() {
        if (this._selectedIndex == this.DataSource!.length - 1) return;
        this.Select(this._selectedIndex + 1, false);
        this._listViewController.ScrollTo(this._selectedIndex);
    }

    private OnKeysReturn() {
        if (this._selectedIndex >= 0) {
            this.OnSelectionChanged?.call(this, this.DataSource![this._selectedIndex]);
            this.Hide();
        }
    }


    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        action(this._child);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        if (this.DataSource == null) return;

        //计算弹窗的高度
        let maxHeight = Math.min(this._itemExtent * this._maxShowItems, this.DataSource.length * this._itemExtent);
        let cardMarginTotalHeight = this._child.Margin == null
            ? PixUI.Card.DefaultMargin * 2
            : this._child.Margin.Value.Top + this._child.Margin.Value.Bottom;

        this._child.Layout(this._child.Width!.Value, maxHeight + cardMarginTotalHeight);
        this.SetSize(this._child.W, this._child.H);
    }


    public PreviewEvent(type: PixUI.EventType, e: Nullable<object>): PixUI.EventPreviewResult {
        if (type == PixUI.EventType.KeyDown) {
            let keyEvent = <PixUI.KeyEvent><unknown>e!;
            if (keyEvent.KeyCode == PixUI.Keys.Up) {
                this.OnKeysUp();
                return PixUI.EventPreviewResult.NoDispatch;
            }

            if (keyEvent.KeyCode == PixUI.Keys.Down) {
                this.OnKeysDown();
                return PixUI.EventPreviewResult.NoDispatch;
            }

            if (keyEvent.KeyCode == PixUI.Keys.Return) {
                this.OnKeysReturn();
                return PixUI.EventPreviewResult.NoDispatch;
            }
        }

        return super.PreviewEvent(type, e);
    }

    public Init(props: Partial<ListPopup<T>>): ListPopup<T> {
        Object.assign(this, props);
        return this;
    }

}
