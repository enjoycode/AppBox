import {IChannel} from "./IChannel";
import {EntityFactory} from "@/AppBoxCore";

export class Channel {

    static #_provider: IChannel;

    public static get SessionId(): number {
        return this.#_provider.SessionId;
    }

    public static Init(provider: IChannel) {
        this.#_provider = provider;
    }

    public static Login(user: string, password: string, external?: string): Promise<void> {
        return this.#_provider.Login(user, password, external);
    }

    public static Invoke<T>(service: string, args?: any[], entityFactories?: Map<bigint, EntityFactory>): Promise<T> {
        return this.#_provider.Invoke(service, args, entityFactories);
    }

}