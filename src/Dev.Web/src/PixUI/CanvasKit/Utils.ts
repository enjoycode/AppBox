import {TextBox} from "./TextBox";
import {Canvas, Paragraph, Path, RectHeightStyle, RectWidthStyle} from "canvaskit-wasm";
import {Rect} from "./Rect";
import {Color} from "./Color"

const ckDefaultShadowFlags = 4;
const ckTransparentOccluderShadowFlags = 4 | 1;

const ckShadowAmbientAlpha = 0.039;
const ckShadowSpotAlpha = 0.25;
const ckShadowLightRadius = 1.1;
const ckShadowLightHeight = 600.0;
const ckShadowLightXOffset = 0;
const ckShadowLightYOffset = -450;

export class Utils {
    public static GetRectForPosition(ph: Paragraph, pos: number,
                                     heightStyle: RectHeightStyle, widthStyle: RectWidthStyle): TextBox {
        let list: any = ph.getRectsForRange(pos, pos + 1, heightStyle, widthStyle);
        let res = new TextBox();
        res.Rect = new Rect(list[0][0], list[0][1], list[0][2], list[0][3]);
        res.Direction = list[0].direction === 1 ? CanvasKit.TextDirection.LTR : CanvasKit.TextDirection.RTL;
        return res;
    }

    public static DrawShadow(canvas: Canvas, path: Path, color: Color,
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
}
