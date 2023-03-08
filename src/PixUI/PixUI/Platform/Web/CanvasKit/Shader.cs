#if __WEB__
namespace PixUI;

[TSType("CanvasKit.Shader")]
public class Shader
{
    [TSTemplate("CanvasKit.Shader.MakeLinearGradient({1},{2},{3},{4},{5})")]
    public static Shader? CreateLinearGradient(Point start, Point end, Color[] colors, float[]? colorPos,
        ShaderTileMode mode) => new();

    [TSTemplate("CanvasKit.Shader.MakeRadialGradient({1},{2},{3},{4},{5})")]
    public static Shader? CreateRadialGradient(Point center, float radius, Color[] colors, float[]? colorPos,
        ShaderTileMode mode) => new();
}
#endif