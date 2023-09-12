using System.Text.Json.Serialization;

namespace AppBoxClient.Dynamic;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "Type")]
[JsonDerivedType(typeof(LineSeriesSettings), typeDiscriminator: "Line")]
public abstract class CartesianSeriesSettings : ChartSeriesSettings
{
    public abstract CartesianSeriesSettings Clone();
}