import * as PixUI from '@/PixUI'

export class WebPreviewer extends PixUI.View {
    
    
    private async Run(url: string) {
        let widget = await import(url);
    }
    
}