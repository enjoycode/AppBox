import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export class DevController {
    public static readonly ActiveSidePad: PixUI.State<AppBoxDesign.SidePadType> = PixUI.State.op_Implicit_From(AppBoxDesign.SidePadType.DesignTree);
}
