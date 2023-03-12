import {TextBox} from "./TextBox";
import {
    Canvas,
    Paragraph,
    ParagraphBuilder,
    ParagraphStyle,
    Path,
    RectHeightStyle,
    RectWidthStyle,
    TextStyle
} from "canvaskit-wasm";
import {Rect} from "./Rect";
import {Color} from "./Color"
import {FontCollection} from "@/PixUI";

const ckDefaultShadowFlags = 4;
const ckTransparentOccluderShadowFlags = 4 | 1;

const ckShadowAmbientAlpha = 0.039;
const ckShadowSpotAlpha = 0.25;
const ckShadowLightRadius = 1.1;
const ckShadowLightHeight = 600.0;
const ckShadowLightXOffset = 0;
const ckShadowLightYOffset = -450;

export function GetRectForPosition(ph: Paragraph, pos: number,
                                   heightStyle: RectHeightStyle, widthStyle: RectWidthStyle): TextBox {
    let list: any = ph.getRectsForRange(pos, pos + 1, heightStyle, widthStyle);
    let res = new TextBox();
    res.Rect = new Rect(list[0].rect[0], list[0].rect[1], list[0].rect[2], list[0].rect[3]);
    res.Direction = list[0].dir === 1 ? CanvasKit.TextDirection.LTR : CanvasKit.TextDirection.RTL;
    return res;
}

export function DrawShadow(canvas: Canvas, path: Path, color: Color,
                           elevation: number, transparentOccluder: boolean, devicePixelRatio: number) {
    let flags = transparentOccluder ? ckTransparentOccluderShadowFlags : ckDefaultShadowFlags;

    let inAmbient = color.WithAlpha(Math.round(color.Alpha * ckShadowAmbientAlpha));
    let inSpot = color.WithAlpha(Math.round(color.Alpha * ckShadowSpotAlpha));

    let tonalColors = CanvasKit.computeTonalColors({ambient: inAmbient, spot: inSpot});

    canvas.drawShadow(path,
        [0, 0, devicePixelRatio * elevation],
        [ckShadowLightXOffset, ckShadowLightYOffset, devicePixelRatio * ckShadowLightHeight],
        devicePixelRatio * ckShadowLightRadius,
        tonalColors.ambient,
        tonalColors.spot,
        flags);
}

export function MakeTextStyle(ts: TextStyle): TextStyle {
    if (ts.fontFamilies == null || ts.fontFamilies.length === 0) {
        ts.fontFamilies = [FontCollection.DefaultFontFamily];
    }
    return new CanvasKit.TextStyle(ts);
}

export function MakeParagraphStyle(ps: ParagraphStyle): ParagraphStyle {
    if (ps.textStyle == null)
        ps.textStyle = {};
    return new CanvasKit.ParagraphStyle(ps);
}

export function MakeParagraphBuilder(ps: ParagraphStyle): ParagraphBuilder {
    return CanvasKit.ParagraphBuilder.MakeFromFontProvider(ps, FontCollection.Instance.FontProvider);
}

export function ConvertRadiusToSigma(radius: number): number {
    return radius > 0 ? 0.57735 * radius + 0.5 : 0.0;
}