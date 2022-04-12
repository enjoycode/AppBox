import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class PlatformDragDropService {
    public Init(props: Partial<PlatformDragDropService>): PlatformDragDropService {
        Object.assign(this, props);
        return this;
    }

}
