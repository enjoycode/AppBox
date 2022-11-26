using System;
using System.Threading.Tasks;

namespace PixUI
{
    public sealed class FutureBuilder<T> : DynamicView
    {
        public FutureBuilder(Task<T> future,
            Func<T, Widget> doneBuilder,
            Func<Exception, Widget?>? errorBuilder = null,
            Func<Widget>? runningBuilder = null)
        {
            _doneBuilder = doneBuilder;
            _errorBuilder = errorBuilder;

            if (runningBuilder != null)
                ReplaceTo(runningBuilder());

            Run(future);
        }

        private readonly Func<T, Widget> _doneBuilder;
        private readonly Func<Exception, Widget?>? _errorBuilder;

        private async void Run(Task<T> future)
        {
            try
            {
                var res = await future;
                ReplaceTo(_doneBuilder(res));
            }
            catch (Exception ex)
            {
                if (_errorBuilder != null)
                    ReplaceTo(_errorBuilder(ex));
            }
        }

    }
}

