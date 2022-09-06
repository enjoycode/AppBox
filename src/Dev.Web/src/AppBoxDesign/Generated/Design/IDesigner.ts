import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export interface IDesigner {
    SaveAsync(): Promise<void>;

    RefreshAsync(): Promise<void>;
}

export interface IModelDesigner extends IDesigner {
    get ModelNode(): AppBoxDesign.ModelNodeVO;


    GetOutlinePad(): Nullable<PixUI.Widget>;
}

export function IsInterfaceOfIModelDesigner(obj: any): obj is IModelDesigner {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_AppBoxDesign_IModelDesigner' in obj.constructor;
}
