import {Cursor, IPlatformCursors} from "@/PixUI/Generated/Platform/Cursor";

class WebCursor extends Cursor {
    readonly Name: string;

    constructor(name: string) {
        super();
        this.Name = name;
    }
}

export class WebCursors implements IPlatformCursors {
    private static readonly _arrow = new WebCursor('auto');
    private static readonly _hand = new WebCursor("pointer")
    private static readonly _ibeam = new WebCursor('text');
    private static readonly _resizeLR = new WebCursor('e-resize');
    private static readonly _resizeUD = new WebCursor('s-resize');

    get Arrow(): Cursor {
        return WebCursors._arrow;
    }

    get Hand(): Cursor {
        return WebCursors._hand;
    }

    get IBeam(): Cursor {
        return WebCursors._ibeam;
    }

    get ResizeLR(): Cursor {
        return WebCursors._resizeLR;
    }

    get ResizeUD(): Cursor {
        return WebCursors._resizeUD;
    }

    SetCursor(cursor: Cursor): void {
        window.document.body.style.cursor = (<WebCursor>cursor).Name;
    }

}
