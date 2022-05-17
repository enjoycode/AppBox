using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AppBoxClient;
using CodeEditor;
using PixUI;

namespace AppBoxDesign
{
    /// <summary>
    /// 用于同步客户端代码编辑器的变更至服务端
    /// </summary>
    [TSNoInitializer]
    internal sealed class ModelCodeSyncService
    {
        private readonly int _targetType;
        private readonly string _targetId;
        private int _submittingFlag = 0;
        private readonly List<ChangeItem> _queue = new List<ChangeItem>();

        public ModelCodeSyncService(int targetType, string targetId)
        {
            _targetType = targetType;
            _targetId = targetId;
        }

        public void OnDocumentChanged(DocumentEventArgs e)
        {
#if __WEB__
            _queue.Add(new ChangeItem(e.Offset, e.Length, e.Text));
#else
            lock (_queue)
            {
                _queue.Add(new ChangeItem(e.Offset, e.Length, e.Text));
            }
#endif

            StartSubmit();
        }

        private async Task StartSubmit()
        {
#if __WEB__
            if (_submittingFlag != 0) return;
            _submittingFlag = 1;
            while (_queue.Count > 0)
            {
                var item = _queue[0];
                await Channel.Invoke("sys.DesignService.ChangeBuffer", new object[]
                {
                    _targetType, _targetId, item.Offset, item.Length, item.Text
                });
                _queue.RemoveAt(0);
            }   
            _submittingFlag = 0;
#else
            if (Interlocked.CompareExchange(ref _submittingFlag, 1, 0) != 0)
                return;

            while (true)
            {
                ChangeItem item;
                lock (_queue)
                {
                    item = _queue[0];
                }

                await Channel.Invoke("sys.DesignService.ChangeBuffer", new object[]
                {
                    _targetType, _targetId, item.Offset, item.Length, item.Text
                });

                lock (_queue)
                {
                    _queue.RemoveAt(0);
                    if (_queue.Count == 0)
                    {
                        Interlocked.Exchange(ref _submittingFlag, 0);
                        break;
                    }
                }
            }
#endif
        }
    }

    internal readonly struct ChangeItem
    {
        public readonly int Offset;
        public readonly int Length;
        public readonly string Text;

        public ChangeItem(int offset, int length, string text)
        {
            Offset = offset;
            Length = length;
            Text = text;
        }
    }
}