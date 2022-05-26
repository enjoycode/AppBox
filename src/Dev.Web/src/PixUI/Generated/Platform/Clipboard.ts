import * as System from '@/System'

export class Clipboard {
    private static _platformClipboard: IPlatformClipboard;

    public static Init(platformClipboard: IPlatformClipboard) {
        this._platformClipboard = platformClipboard;
    }

    public static WriteText(text: string): System.ValueTask {
        return this._platformClipboard.WriteText(text);
    }

    public static ReadText(): System.ValueTask<string | null> {
        return this._platformClipboard.ReadText();
    }
}

export interface IPlatformClipboard {
    WriteText(text: string): System.ValueTask;

    ReadText(): System.ValueTask<string | null>;
}