import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Simulation {
    #Tolerance: PixUI.Tolerance;
    public get Tolerance() {
        return this.#Tolerance;
    }

    private set Tolerance(value) {
        this.#Tolerance = value;
    }

    public constructor(tolerance: Nullable<PixUI.Tolerance> = null) {
        this.Tolerance = tolerance ?? PixUI.Tolerance.Default;
    }

    public abstract X(time: number): number;

    public abstract Dx(time: number): number;

    public abstract IsDone(time: number): boolean;
}
