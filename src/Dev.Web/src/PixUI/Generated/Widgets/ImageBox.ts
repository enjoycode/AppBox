import * as PixUI from '@/PixUI'

export class ImageBox extends PixUI.Widget {
    private readonly _imgSrc: PixUI.State<PixUI.ImageSource>;

    public constructor(imgSrc: PixUI.State<PixUI.ImageSource>) {
        super();
        this._imgSrc = this.Bind(imgSrc, PixUI.BindingOptions.AffectsLayout);
    }

    public get IsOpaque(): boolean {
        //根据图像是否透明来返回
        if (this._imgSrc.Value.Loading && this._imgSrc.Value.Image == null) return false;
        return this._imgSrc.Value.Image!.getImageInfo().alphaType == CanvasKit.AlphaType.Opaque;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        //TODO:根据是否指定大小及加载状态及加载的图像大小来计算
        this.SetSize(width, height);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this._imgSrc.Value.Loading) {
            //TODO: paint loading widget
            return;
        }

        let img = this._imgSrc.Value.Image;
        if (img == null) {
            //TODO: paint error widget
            return;
        }

        //TODO:暂简单绘制，应根据大小及fit
        // @ts-ignore //TODO:尝试忽略web端canvaskit的paint参数
        canvas.drawImageRect(img, PixUI.Rect.FromLTWH(0, 0, img.width, img.height),
            PixUI.Rect.FromLTWH(0, 0, this.W, this.H));
    }
}
