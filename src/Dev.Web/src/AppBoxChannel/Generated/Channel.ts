import {IChannel} from "./IChannel";

export class Channel {

    static #_provider: IChannel;

    public static Init(provider: IChannel) {
        this.#_provider = provider;
    }

    public static async Login(user: string, password: string, external?: string): Promise<string | null> {
        return this.#_provider.Login(user, password, external);
    }

}