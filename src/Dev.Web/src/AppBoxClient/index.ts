import {Entity} from "@/AppBoxCore";
import {ObjectNotifier, RxProperty, State} from "@/PixUI";
import {Func2, Action2} from "@/System";
import {RxEntity} from "./RxEntity";

export * from "./Channel/IChannel"
export * from "./Channel/Channel"
export * from "./Channel/WebChannel"

export * from "./RxEntity"

export const initializeAppBoxClient = () => {
    Object.defineProperty(Entity.prototype, "Observe", {
        value: function Observe<TEntity, TMember>(memberId: number, getter: Func2<TEntity, TMember>, setter: Action2<TEntity, TMember>): State<TMember> {
            //TODO:暂使用RxProperty
            let rxMember = new RxProperty<TMember>(() => getter(this), v => setter(this, v));
            this.PropertyChanged.Add((mid: number) => {
                if (mid === memberId)
                    rxMember.NotifyValueChanged();
            })
            return rxMember;
        },
        writable: true,
        configurable: true,
    });

    Object.defineProperty(ObjectNotifier.prototype, "BindToRxEntity", {
        value: function BindToRxEntity<T extends Entity>(rxEntity: RxEntity<T>): void {
            this.OnChange = (t: T) => {
                rxEntity.Target = t;
            }
        },
        writable: true,
        configurable: true,
    });
}

