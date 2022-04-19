import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class IconData {
    public readonly CodePoint: number;
    public readonly FontFamily: string;
    public readonly AssemblyName: string;
    public readonly AssetPath: string;

    public constructor(codePoint: number, fontFamily: string, assemblyName: string, assetPath: string) {
        this.CodePoint = codePoint;
        this.FontFamily = fontFamily;
        this.AssemblyName = assemblyName;
        this.AssetPath = assetPath;
    }

    public Clone(): IconData {
        return new IconData(this.CodePoint, this.FontFamily, this.AssemblyName, this.AssetPath);
    }
}
