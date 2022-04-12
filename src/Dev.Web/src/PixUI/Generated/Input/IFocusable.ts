import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface IFocusable {
    get FocusNode(): PixUI.FocusNode;

}

export function IsInterfaceOfIFocusable(obj: any): obj is IFocusable {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_PixUI_IFocusable' in obj.constructor;
}
