import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPolarAxis extends LiveChartsCore.IPlane {
    get Orientation(): LiveChartsCore.PolarAxisOrientation;


    get Ro(): number;

    set Ro(value: number);

    get LabelsAngle(): number;

    set LabelsAngle(value: number);

    get LabelsVerticalAlignment(): LiveChartsCore.Align;

    set LabelsVerticalAlignment(value: LiveChartsCore.Align);

    get LabelsHorizontalAlignment(): LiveChartsCore.Align;

    set LabelsHorizontalAlignment(value: LiveChartsCore.Align);

    get LabelsPadding(): LiveChartsCore.Padding;

    set LabelsPadding(value: LiveChartsCore.Padding);

    get LabelsBackground(): LiveChartsCore.LvcColor;

    set LabelsBackground(value: LiveChartsCore.LvcColor);

    Initialize(orientation: LiveChartsCore.PolarAxisOrientation): void;

}
