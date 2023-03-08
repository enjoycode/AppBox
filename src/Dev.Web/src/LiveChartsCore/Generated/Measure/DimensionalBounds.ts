import * as LiveChartsCore from '@/LiveChartsCore'

export class DimensionalBounds {
    public constructor(setMinBounds: boolean = false) {
        this.PrimaryBounds = new LiveChartsCore.Bounds();
        this.SecondaryBounds = new LiveChartsCore.Bounds();
        this.TertiaryBounds = new LiveChartsCore.Bounds();
        this.VisiblePrimaryBounds = new LiveChartsCore.Bounds();
        this.VisibleSecondaryBounds = new LiveChartsCore.Bounds();
        this.VisibleTertiaryBounds = new LiveChartsCore.Bounds();

        if (!setMinBounds) return;

        this.VisiblePrimaryBounds.AppendValue(0);
        this.VisiblePrimaryBounds.AppendValue(10);
        this.PrimaryBounds.AppendValue(0);
        this.PrimaryBounds.AppendValue(10);

        this.VisibleSecondaryBounds.AppendValue(0);
        this.VisibleSecondaryBounds.AppendValue(10);
        this.SecondaryBounds.AppendValue(0);
        this.SecondaryBounds.AppendValue(10);

        this.VisibleTertiaryBounds.AppendValue(1);
        this.TertiaryBounds.AppendValue(1);

        this.IsEmpty = true;
    }

    #IsEmpty: boolean = false;
    public get IsEmpty() {
        return this.#IsEmpty;
    }

    private set IsEmpty(value) {
        this.#IsEmpty = value;
    }

    public PrimaryBounds: LiveChartsCore.Bounds;

    public SecondaryBounds: LiveChartsCore.Bounds;

    public TertiaryBounds: LiveChartsCore.Bounds;

    public VisiblePrimaryBounds: LiveChartsCore.Bounds;

    public VisibleSecondaryBounds: LiveChartsCore.Bounds;

    public VisibleTertiaryBounds: LiveChartsCore.Bounds;
}
