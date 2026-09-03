using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

internal sealed class IconSerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        var obj = (IconData)value;
        writer.WriteString(obj.Asset.AssetPath);
        writer.WriteString(obj.Asset.AssemblyName);
        writer.WriteString(obj.Asset.FontFamily);
        writer.WriteInt(obj.CodePoint);
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var assetPath = reader.ReadString()!;
        var assemblyName = reader.ReadString()!;
        var fontFamily = reader.ReadString()!;
        var codePoint = reader.ReadInt();
        return new IconData(codePoint, new IconAsset(fontFamily, assemblyName, assetPath));
    }
}