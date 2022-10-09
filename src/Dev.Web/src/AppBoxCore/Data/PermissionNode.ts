import {List, Guid} from "@/System";
import {IBinSerializable, IInputStream, IOutputStream} from "@/AppBoxCore";

export class PermissionNode implements IBinSerializable {
    public Name: string;
    public Children?: List<PermissionNode>;
    public ModelId: string | null;
    public OrgUnits?: List<Guid>;

    ReadFrom(bs: IInputStream): void {
    }

    WriteTo(bs: IOutputStream): void {
    }
}