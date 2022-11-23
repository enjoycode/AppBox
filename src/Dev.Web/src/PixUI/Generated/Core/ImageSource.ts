import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 图像来源
/// </summary>
export class ImageSource {
    #Loading: boolean = true;
    public get Loading() {
        return this.#Loading;
    }

    private set Loading(value) {
        this.#Loading = value;
    }

    #Image: Nullable<PixUI.Image>;
    public get Image() {
        return this.#Image;
    }

    private set Image(value) {
        this.#Image = value;
    }

    private constructor() {
    }

    public static FromEncodedData(data: Uint8Array): ImageSource {
        let imgSrc = new ImageSource().Init(
            {
                Loading: false,
                Image: CanvasKit.MakeImageFromEncoded(data)
            });
        return imgSrc;
    }

    public static FromNetwork(url: string): ImageSource {
        throw new System.NotImplementedException();
    }
}
