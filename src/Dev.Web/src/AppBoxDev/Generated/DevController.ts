import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export class DevController {
    public static readonly ActiveSidePad: PixUI.State<AppBoxDev.SidePadType> = PixUI.State.op_Implicit_From(AppBoxDev.SidePadType.DesignTree);
}
