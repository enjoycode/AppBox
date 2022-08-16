using System;
using PixUI;

namespace AppBoxDesign
{
    [TSNoInitializer]
    internal sealed class PreviewController
    {
        public readonly ModelNodeVO ModelNode;
        private Action? _invalidateAction;

        public PreviewController(ModelNodeVO modelNode)
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