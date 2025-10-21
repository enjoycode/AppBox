using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

// ReSharper disable once ClassNeverInstantiated.Global
internal sealed class TableStylesPropEditor : ValueEditorBase
{
    public TableStylesPropEditor(State<TableStyles?> state, DesignElement element) : base(element)
    {
        _state = state;
        _element = element;

        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<TableStyles?> _state;
    private readonly DesignElement _element;

    private async void OnTap(PointerEvent _)
    {
        var cloned = _state.Value == null ? new TableStyles() : _state.Value.Clone();
        var dlg = new TableStylesDialog(cloned, _element);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _state.Value = cloned;
    }
}