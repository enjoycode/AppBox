import * as System from '@/System'

export interface IWeigthedMapLand extends System.INotifyPropertyChanged {
    get Name(): string;

    set Name(value: string);

    get Value(): number;

    set Value(value: number);
}
