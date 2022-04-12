import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class PropagateEvent {
    #IsHandled: boolean = false;
    public get IsHandled() {
        return this.#IsHandled;
    }

    private set IsHandled(value) {
        this.#IsHandled = value;
    }

    public StopPropagate() {
        this.IsHandled = true;
    }

    public ResetHandled() {
        this.IsHandled = false;
    }
}
