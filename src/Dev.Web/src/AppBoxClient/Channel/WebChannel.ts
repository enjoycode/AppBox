import {IChannel} from "./IChannel";
import {InvokeErrorCode} from "./InvokeErrorCode";
import {MessageType} from "./MessageType";
import {BytesOutputStream} from "../Serialization/BytesOutputStream";
import {BytesInputStream} from "../Serialization/BytesInputStream";

export class WebChannel implements IChannel {
    #_socket: WebSocket;
    #_connectDone?: Promise<void>;
    #_msgIdIndex = 0;         // 当前消息流水计数器
    private readonly waitHandles: Map<number, any> = new Map<number, any>();       // 待回复的请求列表
    //private eventHandlers: Map<number, IEventHandler> = new Map<number, IEventHandler>();

    //region ====WebSocket====
    /** 连接至服务端 */
    private Connect(): Promise<void> {
        let scheme = document.location.protocol === 'https:' ? 'wss' : 'ws';
        let port = document.location.port ? (':' + document.location.port) : '';
        let connectionUrl = scheme + '://' + document.location.hostname + port + '/ws';

        console.log("Start connect to : " + connectionUrl);
        this.#_socket = new WebSocket(connectionUrl);
        this.#_socket.binaryType = 'arraybuffer';
        this.#_socket.onmessage = e => this.OnMessage(e);
        this.#_connectDone = new Promise<void>((resolve, reject) => {
            this.#_socket.onopen = e => {
                console.log("WebSocket connect done.");
                resolve();
            };
            this.#_socket.onclose = e => {
                // See https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
                if (e.code === 1006) {
                    console.warn("WebSocket connect failed.");
                    reject();
                } else if (e.code !== 1000) {
                    console.warn("连接关闭, 请重新登录");
                    // store.router.replace('/')
                }
                this.#_socket = null;
                this.#_connectDone = null;
            };
        });

        return this.#_connectDone;
    }

    /** 接收到服务端消息，格式参照说明 */
    private OnMessage(event: MessageEvent) {
        // console.log("收到WebSocket消息:", event.data);

        if (event.data instanceof ArrayBuffer) {
            let rs = new BytesInputStream(event.data);
            let msgType = rs.ReadByte(); //先读消息类型
            if (msgType == MessageType.InvokeResponse) {
                this.ProcessInvokeResponse(rs).catch(err => console.warn(err));
            } else if (msgType == MessageType.LoginResponse) {
                this.ProcessLoginResponse(rs);
            } else if (msgType == MessageType.Event) {
                //this.processEventMessage(rs);
            } else {
                console.warn('Receive unknown message type:', msgType);
            }
        } else {
            console.warn('Receive none binary message: ', event.data);
        }
    }

    private ProcessLoginResponse(stream: BytesInputStream) {
        const reqMsgId = stream.ReadInt32();
        const loginOk = stream.ReadBool();
        //TODO: not ok, read error message
        let errorMsg: string | null = null;
        this.SetResponse(reqMsgId, InvokeErrorCode.None, errorMsg);
    }

    /** 处理收到的调用服务的响应 */
    private async ProcessInvokeResponse(stream: BytesInputStream) {
        let reqMsgId = stream.ReadInt32();
        let errorCode: InvokeErrorCode = stream.ReadByte();
        let result: any;
        if (stream.Remaining > 0) { //因有些错误可能不包含数据，只有错误码
            try {
                result = await stream.DeserializeAsync();
            } catch (error) {
                errorCode = InvokeErrorCode.DeserializeResponseFail;
                result = error;
            }
        }
        this.SetResponse(reqMsgId, errorCode, result);
    }

    /** 处理收到的事件消息 */
    // private ProcessEventMessage(stream: BytesInputStream) {
    //     let eventId = stream.ReadInt32();
    //     let handler = this.eventHandlers.get(eventId);
    //     if (handler) {
    //         handler.process(stream);
    //     } else {
    //         console.warn("Can't get EventHandler: " + eventId);
    //     }
    // }

    /** 正常收到响应或发送失败后设置等待结果 */
    private SetResponse(reqId: number, error: InvokeErrorCode, result: any) {
        //console.log('收到调用回复: ', error, result);

        let waitHandler = this.waitHandles.get(reqId);
        if (!waitHandler) {
            console.warn("Request has time out");
            return;
        }

        this.waitHandles.delete(reqId);
        const cb = waitHandler.Cb;
        // console.log('移除请求等待者, 还余: ' + waitHandles.length)
        if (error != InvokeErrorCode.None) {
            cb(error.toString() + ':' + result, null);
        } else {
            cb(null, result);
        }
    }

    /** 创建消息标识号，如果挂起列表内存在则通知其超时 */
    private MakeMsgId(): number {
        this.#_msgIdIndex++;
        if (this.#_msgIdIndex > 0x7FFFFFFF) {
            this.#_msgIdIndex = 0;
        }
        //TODO: check pending request has contains
        return this.#_msgIdIndex;
    }

    private async SendMessage(data: Uint8Array) {
        if (!this.#_socket || this.#_socket.readyState !== WebSocket.OPEN) {
            if (this.#_socket && this.#_socket.readyState === WebSocket.CONNECTING) {
                await this.#_connectDone;
            } else {
                await this.Connect();
            }
        }

        try {
            this.#_socket.send(data);
        } catch (error) {
            console.error('WebSocket发送数据错误: ' + error);
            //this.setInvokeResponse(req.I, InvokeErrorCode.SendRequestFail, error);
        }
    }

    //endregion

    //region ====IChannel====
    private MakePromise(reqId: number): Promise<any> {
        let waitHandler: any = {Cb: null};
        let promise = new Promise<any>((resolve, reject) => {
            waitHandler.Cb = (err: any, res: any) => {
                if (err) reject(err);
                else resolve(res);
            }
        });
        this.waitHandles.set(reqId, waitHandler);
        return promise;
    }

    async Login(user: string, password: string, external?: string): Promise<string | null> {
        //加入等待者列表
        const msgId = this.MakeMsgId();
        let promise = this.MakePromise(msgId);

        //序列化消息
        let ws = new BytesOutputStream();
        //写入消息头
        ws.WriteByte(MessageType.LoginRequest);
        ws.WriteInt32(msgId);
        //写入消息体
        ws.WriteString(user);
        ws.WriteString(password);

        //发送请求并等待响应
        await this.SendMessage(ws.Bytes);
        return promise;
    }

    Logout(): Promise<boolean> {
        return Promise.resolve(false);
    }

    async Invoke(service: string, args?: any[]): Promise<any> {
        //加入等待者列表
        const msgId = this.MakeMsgId();
        let promise = this.MakePromise(msgId);

        //序列化消息
        let ws = new BytesOutputStream();
        //写入消息头
        ws.WriteByte(MessageType.InvokeRequest);
        ws.WriteInt32(msgId);
        //写入消息体
        ws.WriteString(service);
        if (args) {
            for (const arg of args) {
                await ws.SerializeAsync(arg);
            }
        }

        //发送请求并等待响应
        await this.SendMessage(ws.Bytes);
        return promise;
    }

    //endregion

}