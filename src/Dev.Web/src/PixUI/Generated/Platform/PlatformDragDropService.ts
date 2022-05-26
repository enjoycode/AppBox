export class PlatformDragDropService {

    public Init(props: Partial<PlatformDragDropService>): PlatformDragDropService {
        Object.assign(this, props);
        return this;
    }

}
