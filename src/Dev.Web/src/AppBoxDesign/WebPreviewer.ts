import * as PixUI from '@/PixUI'

export class WebPreviewer extends PixUI.View {


    private async Run(url: string) {
        let module = await import(/* @vite-ignore */url);
    }

}