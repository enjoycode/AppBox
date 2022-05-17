import {IChannel} from "./IChannel";

export class Channel {

    static #_provider: IChannel;

    public static Init(provider: IChannel) {
        this.#_provider = provider;
    }

    public static Login(user: string, password: string, external?: string): Promise<void> {
        return this.#_provider.Login(user, password, external);
    }

    public static Invoke(service: string, args?: any[]): Promise<any> {
        return this.#_provider.Invoke(service, args);
    }

}