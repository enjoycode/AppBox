import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class TextChange implements AppBoxCore.IBinSerializable {
    #Offset: number = 0;
    public get Offset() {
        return this.#Offset;
    }

    private set Offset(value) {
        this.#Offset = value;
    }

    #Length: number = 0;
    public get Length() {
        return this.#Length;
    }

    private set Length(value) {
        this.#Length = value;
    }

    #Text: Nullable<string>;
    public get Text() {
        return this.#Text;
    }

    private set Text(value) {
        this.#Text = value;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.Offset = rs.ReadInt();
        this.Length = rs.ReadInt();
        this.Text = rs.ReadString();
    }
}