export interface IChannel {
    /** 登录至服务端
     * @return 有错误返回错误信息，成功返回null
     */
    Login(user: string, password: string, external?: string): Promise<string | null>;

    Logout(): Promise<boolean>;

    Invoke(service: string, args: any[]): Promise<any>;
}