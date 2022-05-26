import * as System from '@/System'

export class Clipboard {
    private static _platformClipboard: IPlatformClipboard;

    public static Init(platformClipboard: IPlatformClipboard) {
        Clipboard._platformClipboard = platformClipboard;
    }

    public static WriteText(text: string): System.ValueTask {
        return Clipboard._platformClipboard.WriteText(text);
    }

    public static ReadText(): System.ValueTask<Nullable<string>> {
        return Clipboard._platformClipboard.ReadText();
    }
}

export interface IPlatformClipboard {
    WriteText(text: string): System.ValueTask;

    ReadText(): System.ValueTask<Nullable<string>>;
}
