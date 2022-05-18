using System;

namespace AppBoxDesign
{
    internal sealed class PreviewController
    {
        public readonly ModelNode ModelNode;
        private Action? _invalidateAction;

        public PreviewController(ModelNode modelNode)
        {
            ModelNode = modelNode;
        }

        internal Action InvalidateAction
        {
            set => _invalidateAction = value;
        }

        public void Invalidate() => _invalidateAction?.Invoke();
    }
}