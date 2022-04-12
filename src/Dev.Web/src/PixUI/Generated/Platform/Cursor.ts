import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Cursor {
    public static PlatformCursors: IPlatformCursors;

    public static set Current(value: Cursor) {
        Cursor.PlatformCursors.SetCursor(value);
    }
}

export class Cursors {
    public static get Arrow(): Cursor {
        return Cursor.PlatformCursors.Arrow;
    }

    public static get Hand(): Cursor {
        return Cursor.PlatformCursors.Hand;
    }

    public static get IBeam(): Cursor {
        return Cursor.PlatformCursors.IBeam;
    }

    public static get ResizeLR(): Cursor {
        return Cursor.PlatformCursors.ResizeLR;
    }

    public static get ResizeUD(): Cursor {
        return Cursor.PlatformCursors.ResizeUD;
    }
}

export interface IPlatformCursors {
    get Arrow(): Cursor;


    get Hand(): Cursor;


    get IBeam(): Cursor;


    get ResizeLR(): Cursor;


    get ResizeUD(): Cursor;


    SetCursor(cursor: Cursor): void;
}
