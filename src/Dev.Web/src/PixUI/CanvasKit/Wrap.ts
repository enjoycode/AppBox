import {
    ParagraphBuilder as CKParagraphBuilder,
    ParagraphStyle as CKParagraphStyle,
    ParagraphStyleConstructor,
    TextStyle as CKTextStyle,
    TextStyleConstructor
} from "canvaskit-wasm";
import {FontCollection} from "@/PixUI/CanvasKit/FontCollection";

export interface ParagraphBuilderConstructor {
    new(ps: CKParagraphStyle): CKParagraphBuilder;
}

// @ts-ignore
export const TextStyle: TextStyleConstructor = function (ts: CKTextStyle): CKTextStyle {
    if (ts.fontFamilies == null || ts.fontFamilies.length === 0) {
        ts.fontFamilies = [FontCollection.DefaultFontFamily];
    }
    return new CanvasKit.TextStyle(ts);
}

// @ts-ignore
export const ParagraphStyle: ParagraphStyleConstructor = function (ps: CKParagraphStyle): CKParagraphStyle {
    if (ps.textStyle == null)
        ps.textStyle = {};
    return new CanvasKit.ParagraphStyle(ps);
}

// @ts-ignore
export const ParagraphBuilder: ParagraphBuilderConstructor = function (ps: CKParagraphStyle): CKParagraphBuilder {
    return CanvasKit.ParagraphBuilder.MakeFromFontProvider(ps, FontCollection.Instance.FontProvider);
}
