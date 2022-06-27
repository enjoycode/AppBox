import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'

export class CodeProblem implements AppBoxCore.IBinSerializable {
    public StartLine: number = 0;
    public StartColumn: number = 0;
    public EndLine: number = 0;
    public EndColumn: number = 0;
    public IsError: boolean = false;
    public Message: string = "";

    public get Position(): string {
        return `[${this.StartLine + 1}, ${this.StartColumn}] - [${this.EndLine + 1}, ${this.EndColumn}]`;
    }


    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.StartLine = rs.ReadInt();
        this.StartColumn = rs.ReadInt();
        this.EndLine = rs.ReadInt();
        this.EndColumn = rs.ReadInt();
        this.IsError = rs.ReadBool();
        this.Message = rs.ReadString()!;
    }
}
