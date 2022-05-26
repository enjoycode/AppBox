import * as System from '@/System';
import {IPlatformClipboard} from "@/PixUI/Generated/Platform/Clipboard";

export class WebClipboard implements IPlatformClipboard {
    ReadText(): System.ValueTask<string | null> {
        return navigator.clipboard.readText();
    }

    WriteText(text: string): System.ValueTask {
        return navigator.clipboard.writeText(text);
    }
}