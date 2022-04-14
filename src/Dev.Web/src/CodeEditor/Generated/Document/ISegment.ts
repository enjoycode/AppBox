import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export interface ISegment {
    get Offset(): number;

    set Offset(value: number);

    get Length(): number;

    set Length(value: number);
}
