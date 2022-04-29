import {DesignNodeType} from "./DesignNodeType";
import {IList} from "@/System";

export interface IDesignNode {
    get Id(): string;

    get Type(): DesignNodeType;

    get Label(): string;

    get Children(): IList<IDesignNode>;
}