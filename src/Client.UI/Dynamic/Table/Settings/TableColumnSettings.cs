using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "Type")]
[JsonDerivedType(typeof(TextColumnSettings), typeDiscriminator: Text)]
[JsonDerivedType(typeof(GroupColumnSettings), typeDiscriminator: Group)]
[JsonDerivedType(typeof(RowNumColumnSettings), typeDiscriminator: RowNum)]
public abstract class TableColumnSettings : INotifyPropertyChanged
{
    public const string Text = "Text";
    public const string Group = "Group";
    public const string RowNum = "RowNum";

    [JsonIgnore] public abstract string Type { get; }

    private string _label = string.Empty;
    private string _width = string.Empty;
    private HorizontalAlignment _horizontalAlignment;
    private VerticalAlignment _verticalAlignment = VerticalAlignment.Middle;

    public string Label
    {
        get => _label;
        set => SetField(ref _label, value);
    }

    public string Width
    {
        get => _width;
        set => SetField(ref _width, value);
    }

    public HorizontalAlignment HorizontalAlignment
    {
        get => _horizontalAlignment;
        set => SetField(ref _horizontalAlignment, value);
    }

    public VerticalAlignment VerticalAlignment
    {
        get => _verticalAlignment;
        set => SetField(ref _verticalAlignment, value);
    }

    protected internal abstract DataGridColumn<DataRow> BuildColumn(DataGridController<DataRow> controller);

    public abstract TableColumnSettings Clone();

    #region ====INotifyPropertyChanged====

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    protected bool SetField<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value)) return false;
        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }

    #endregion
}