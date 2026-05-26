using System;
using System.Threading.Tasks;
using System.Threading.Tasks.Sources;
using AppBoxCore;

namespace AppBoxClient;

internal sealed class PooledTaskSource<T> : IValueTaskSource<T>
{

    public static ObjectPool<PooledTaskSource<T>> Create(int count)
    {
            return new ObjectPool<PooledTaskSource<T>>(() => new PooledTaskSource<T>(), count);
        }

    private ManualResetValueTaskSourceCore<T> _tsc;

    private PooledTaskSource()
    {
            _tsc.RunContinuationsAsynchronously = true;
        }

    public T GetResult(short token)
    {
            var res = _tsc.GetResult(token);
            _tsc.Reset();
            return res;
        }

    public ValueTaskSourceStatus GetStatus(short token) => _tsc.GetStatus(token);

    public void OnCompleted(Action<object?> continuation, object? state, short token, ValueTaskSourceOnCompletedFlags flags)
        => _tsc.OnCompleted(continuation, state, token, flags);

    public ValueTask<T> WaitAsync()
    {
            //TODO:short path for completed?
            return new ValueTask<T>(this, _tsc.Version);
        }

    public void SetResult(T result) => _tsc.SetResult(result);

}