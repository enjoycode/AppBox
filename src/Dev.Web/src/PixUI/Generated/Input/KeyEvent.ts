import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class KeyEvent extends PixUI.PropagateEvent {
    private static readonly Default: KeyEvent = new KeyEvent(PixUI.Keys.None);

    public static UseDefault(keysData: PixUI.Keys): KeyEvent {
        KeyEvent.Default.KeyData = keysData;
        return KeyEvent.Default;
    }

    #KeyData: PixUI.Keys = 0;
    public get KeyData() {
        return this.#KeyData;
    }

    private set KeyData(value) {
        this.#KeyData = value;
    }

    public get KeyCode(): PixUI.Keys {
        return this.KeyData & PixUI.Keys.KeyCode;
    }

    public get Control(): boolean {
        return (this.KeyData & PixUI.Keys.Control) == PixUI.Keys.Control;
    }

    public get Shift(): boolean {
        return (this.KeyData & PixUI.Keys.Shift) == PixUI.Keys.Shift;
    }

    public get Alt(): boolean {
        return (this.KeyData & PixUI.Keys.Alt) == PixUI.Keys.Alt;
    }

    public constructor(keyData: PixUI.Keys) {
        super();
        this.KeyData = keyData;
    }

    public Init(props: Partial<KeyEvent>): KeyEvent {
        Object.assign(this, props);
        return this;
    }
}
