using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "Type")]
[JsonDerivedType(typeof(TextColumnSettings), typeDiscriminator: "Type")]
public abstract class ColumnSettings
{
    public string Label { get; set; } = string.Empty;

    protected internal abstract DataGridColumn<DynamicEntity> BuildColumn();
}