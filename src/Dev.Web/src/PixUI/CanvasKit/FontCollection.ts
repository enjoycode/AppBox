import {Typeface, TypefaceFontProvider} from "canvaskit-wasm";
import * as System from "@/System";

export class FontCollection {

    public static DefaultFontFamily = "MiSans";

    private static _instance: FontCollection;

    public static get Instance() {
        return FontCollection._instance;
    }

    public static Init(defaultFontData: ArrayBuffer) {
        let fontProvider = CanvasKit.TypefaceFontProvider.Make();
        FontCollection._instance = new FontCollection(fontProvider);
        FontCollection._instance.RegisterTypeface(defaultFontData, FontCollection.DefaultFontFamily);
    }

    public readonly FontChanged = new System.Event<void>();
    private readonly _fontProvider: TypefaceFontProvider;
    private readonly _loading: Set<string> = new Set<string>();
    private readonly _loaded: Map<string, Typeface> = new Map<string, Typeface>();

    public get FontProvider(): TypefaceFontProvider {
        return this._fontProvider;
    }

    private constructor(fontProvider: TypefaceFontProvider) {
        this._fontProvider = fontProvider;
    }

    private RegisterTypeface(data: ArrayBuffer | Uint8Array, familyName: string): Typeface | null {
        let typeface = CanvasKit.Typeface.MakeFreeTypeFaceFromData(data);
        if (!typeface) {
            console.log("Can't decode font data");
            return null;
        }

        let utf8Data = new TextEncoder().encode(familyName);
        let memObj = CanvasKit.Malloc(Uint8Array, utf8Data.length + 1);
        memObj.toTypedArray().set(utf8Data);
        (<any>this._fontProvider)._registerFont(typeface, memObj.byteOffset);
        CanvasKit.Free(memObj);

        // Add to map and raise event
        this._loaded.set(familyName, typeface);
        this.FontChanged.Invoke();
    }

    public TryMatchFamilyFromAsset(fontFamily: string): Typeface | null {
        return this._loaded.get(fontFamily);
    }

    public StartLoadFontFromAsset(assemblyName: string, assetPath: string, fontFamily: string) {
        if (this._loading.has(fontFamily))
            return;
        this._loading.add(fontFamily);

        console.log(`Start load font: ${assemblyName} ${assetPath} ${fontFamily}`);
        //TODO: 暂简单实现
        if (assemblyName != "PixUI") return;

        fetch('/' + assetPath).then(response => {
            return response.arrayBuffer();
        }).then(data => {
            this.RegisterTypeface(data, fontFamily);
            this._loading.delete(fontFamily);
        });
    }
}
