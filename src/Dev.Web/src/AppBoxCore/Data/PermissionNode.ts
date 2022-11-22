import {List, Guid} from "@/System";
import {IBinSerializable, IInputStream, IOutputStream} from "@/AppBoxCore";

export class PermissionNode implements IBinSerializable {
    public Name: string;
    public Children?: List<PermissionNode>;
    public ModelId: string | null;
    public OrgUnits?: List<Guid>;

    ReadFrom(bs: IInputStream): void {
        this.Name = bs.ReadString();
        let count = bs.ReadVariant();
        if (count >= 0) {
            this.Children = new List<PermissionNode>();
            for (let i = 0; i < count; i++) {
                let child = new PermissionNode();
                child.ReadFrom(bs);
                this.Children.Add(child);
            }
        } else {
            this.ModelId = bs.ReadString();
            count = bs.ReadVariant();
            this.OrgUnits = new List<Guid>();
            for (let i = 0; i < count; i++) {
                this.OrgUnits.Add(bs.ReadGuid());
            }
        }
    }

    WriteTo(bs: IOutputStream): void {
        throw new Error("未实现");
    }
}