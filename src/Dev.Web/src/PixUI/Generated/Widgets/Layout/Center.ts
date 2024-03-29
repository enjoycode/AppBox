import * as PixUI from '@/PixUI'

export class Center extends PixUI.SingleChildWidget {
    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        if (this.Child != null) {
            this.Child.Layout(width, height);
            this.Child.SetPosition((width - this.Child.W) / 2, (height - this.Child.H) / 2);
        }

        this.SetSize(width, height);
    }
}
