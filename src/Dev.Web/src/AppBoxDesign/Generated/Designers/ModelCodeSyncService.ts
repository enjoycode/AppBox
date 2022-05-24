import * as AppBoxClient from '@/AppBoxClient'
import * as CodeEditor from '@/CodeEditor'
import * as System from '@/System'
/// <summary>
/// 用于同步客户端代码编辑器的变更至服务端
/// </summary>
export class ModelCodeSyncService {
    private readonly _targetType: number;
    private readonly _targetId: string;
    private _submittingFlag: number = 0;
    private readonly _queue: System.List<ChangeItem> = new System.List<ChangeItem>();

    public constructor(targetType: number, targetId: string) {
        this._targetType = targetType;
        this._targetId = targetId;
    }

    public OnDocumentChanged(e: CodeEditor.DocumentEventArgs) {
        this._queue.Add(new ChangeItem(e.Offset, e.Length, e.Text));

        this.StartSubmit();
    }

    private async StartSubmit(): System.Task {
        if (this._submittingFlag != 0) return;
        this._submittingFlag = 1;
        while (this._queue.length > 0) {
            let item = this._queue[0];
            await AppBoxClient.Channel.Invoke("sys.DesignService.ChangeBuffer", 
                [this._targetType, this._targetId, item.Offset, item.Length, item.Text]);
            this._queue.RemoveAt(0);
        }
        this._submittingFlag = 0;
    }
}

export class ChangeItem {
    public readonly Offset: number;
    public readonly Length: number;
    public readonly Text: string;

    public constructor(offset: number, length: number, text: string) {
        this.Offset = offset;
        this.Length = length;
        this.Text = text;
    }
}
