import * as System from '@/System'
    /// <summary>
    /// 用于通知对象实例的变更
    /// </summary>
    export class ObjectNotifier<T extends object>
    {
        private _changeHandler: Nullable<System.Action1<T>> ;
        public set OnChange(value: System.Action1<T> ) { this._changeHandler = value; }
        public Notify(obj: T )  { this._changeHandler?.call(this, obj); }
    }
