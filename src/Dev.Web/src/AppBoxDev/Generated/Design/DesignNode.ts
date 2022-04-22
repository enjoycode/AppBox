import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export class DesignNode {
    public Children: Nullable<System.IList<DesignNode>>;

    public Init(props: Partial<DesignNode>): DesignNode {
        Object.assign(this, props);
        return this;
    }
}
