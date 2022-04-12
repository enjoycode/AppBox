import {Typeface, TypefaceFontProvider} from "canvaskit-wasm";
import * as System from "@/System";

export class FontCollection {

    public static DefaultFontFamily = "MiSans";

    private static _instance: FontCollection;

    public static get Instance() {
        return FontCollection._instance;
    }

    public static Init(fontProvider: TypefaceFontProvider) {
        FontCollection._instance = new FontCollection(fontProvider);
    }

    public readonly FontChanged = new System.Event<void>();
    private readonly _fontProvider: TypefaceFontProvider;

    public get FontProvider(): TypefaceFontProvider {
        return this._fontProvider;
    }

    private constructor(fontProvider: TypefaceFontProvider) {
        this._fontProvider = fontProvider;
    }

    public TryMatchFamilyFromAsset(fontFamily: string): Typeface | null {
        return null; //TODO:
    }

    public StartLoadFontFromAsset(assemblyName: string, assetPath: string, fontFamily: string) {
        //TODO:
    }
}
