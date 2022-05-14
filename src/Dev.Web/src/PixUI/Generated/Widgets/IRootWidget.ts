import * as PixUI from '@/PixUI'

export interface IRootWidget {
    get Window(): PixUI.UIWindow;

}

export function IsInterfaceOfIRootWidget(obj: any): obj is IRootWidget {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_PixUI_IRootWidget' in obj.constructor;
}
