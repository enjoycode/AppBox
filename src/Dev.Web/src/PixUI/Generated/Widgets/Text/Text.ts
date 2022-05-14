import * as PixUI from '@/PixUI'

export class Text extends PixUI.TextBase {
    public constructor(text: PixUI.State<string>) {
        super(text);
    }

    public Init(props: Partial<Text>): Text {
        Object.assign(this, props);
        return this;
    }
}
