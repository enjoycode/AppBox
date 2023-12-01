using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "Type")]
[JsonDerivedType(typeof(TextColumnSettings), typeDiscriminator: "Text")]
public abstract class TableColumnSettings
{
    [JsonIgnore] public abstract string Type { get; }
    
    public string Label { get; set; } = string.Empty;

    protected internal abstract DataGridColumn<DynamicEntity> BuildColumn();

    public abstract TableColumnSettings Clone();
}