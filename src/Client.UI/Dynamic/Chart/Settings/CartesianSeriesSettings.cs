using System.Text.Json.Serialization;

namespace AppBoxClient.Dynamic;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "Series")]
[JsonDerivedType(typeof(LineSeriesSettings), typeDiscriminator: "Line")]
[JsonDerivedType(typeof(ColumnSeriesSettings), typeDiscriminator: "Column")]
public abstract class CartesianSeriesSettings : ChartSeriesSettings
{
    public abstract CartesianSeriesSettings Clone();
}