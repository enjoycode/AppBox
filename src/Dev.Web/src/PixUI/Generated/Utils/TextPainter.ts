import * as PixUI from '@/PixUI'

export class TextPainter {
    public static BuildParagraph(text: string, width: number, fontSize: number, color: PixUI.Color, fontStyle: Nullable<PixUI.FontStyle> = null, maxLines: number = 1, forceHeight: boolean = false): PixUI.Paragraph {
        let ts = PixUI.MakeTextStyle({color: color, fontSize: fontSize});
        if (fontStyle != null)
            ts.fontStyle = fontStyle;

        let ps = PixUI.MakeParagraphStyle({
            maxLines: (Math.floor(maxLines) & 0xFFFFFFFF),
            textStyle: ts
        });
        if (forceHeight) {
            ts.heightMultiplier = 1;
            ps.heightMultiplier = 1;
        }

        let pb = PixUI.MakeParagraphBuilder(ps);

        pb.pushStyle(ts);
        pb.addText(text);
        pb.pop();
        let ph = pb.build();
        ph.layout(width);
        pb.delete();
        return ph;
    }
}
