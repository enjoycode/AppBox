using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "Type")]
[JsonDerivedType(typeof(TextColumnSettings), typeDiscriminator: "Text")]
public abstract class TableColumnSettings : INotifyPropertyChanged
{
    [JsonIgnore] public abstract string Type { get; }

    private string _label = string.Empty;

    public string Label
    {
        get => _label;
        set => SetField(ref _label, value);
    }

    protected internal abstract DataGridColumn<DynamicEntity> BuildColumn();

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