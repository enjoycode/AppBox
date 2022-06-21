import {EntityFactory} from "@/AppBoxCore";

export interface IChannel {

    get SessionId(): number | null;

    get Name(): string | null;

    /** 登录至服务端 */
    Login(user: string, password: string, external?: string): Promise<void>;

    Logout(): Promise<void>;

    Invoke<T>(service: string, args?: any[], entityFactories?: Map<bigint, EntityFactory>): Promise<T>;
}