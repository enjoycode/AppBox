using System;

namespace PixUI
{
    public abstract class Popup : Widget, IEventHook
    {
        protected Popup(Overlay overlay)
        {
            Overlay = overlay;
        }

        internal readonly Overlay Overlay;
        private PopupTransitionWrap? _transition;

        public static readonly TransitionBuilder DefaultTransitionBuilder =
            (animation, child) =>
            {
                return new ScaleYTransition(animation, null /*TODO*/)
                {
                    Child = child
                };
            };

        public void UpdatePosition(float x, float y)
        {
            SetPosition(x, y);
            Invalidate(InvalidAction.Repaint);
        }

        public void Show(Widget? relativeTo = null,
            Offset? relativeOffset = null, TransitionBuilder? transitionBuilder = null)
        {
            Widget target = this; //没有动画指向自己，有则指向动画组件
            if (transitionBuilder != null)
            {
                _transition = new PopupTransitionWrap(this, transitionBuilder);
                _transition.Forward();
                target = _transition;
            }

            if (relativeTo != null)
            {
                //TODO: 暂只实现在下方显示，应该入参确定相对位置
                var winPt = relativeTo.LocalToWindow(0, 0);
                var offsetX = relativeOffset?.Dx ?? 0;
                var offsetY = relativeOffset?.Dy ?? 0;
                target.SetPosition(winPt.X + offsetX, winPt.Y + relativeTo.H + offsetY);
            }

            Overlay.Window.EventHookManager.Add(this);
            Overlay.Show(target);
        }

        public void Hide( /*TODO:TransitionBuilder*/)
        {
            Overlay.Window.EventHookManager.Remove(this);
            if (_transition != null)
            {
                _transition.Reverse();
            }
            else
            {
                Overlay.Remove(this);
            }
        }

        public virtual EventPreviewResult PreviewEvent(EventType type, object? e)
        {
            return EventPreviewResult.NotProcessed;
        }
    }

    internal sealed class PopupTransitionWrap : SingleChildWidget
    {
        internal PopupTransitionWrap(Popup popup, TransitionBuilder transitionBuilder)
        {
            _overlay = popup.Overlay;
            _controller = new AnimationController(100);
            _controller.StatusChanged += OnStateChanged;

            //先直接布局popup，方便TransitionBuilder时根据popup的大小来确定自身大小
            popup.Layout(popup.Overlay.Window.Width, popup.Overlay.Window.Height);
            //再构建WidgetTree
            Child = transitionBuilder(_controller, new PopupTransitionProxy(popup));
        }

        private readonly AnimationController _controller;
        private readonly Overlay _overlay;

        internal void Forward() => _controller.Forward();

        internal void Reverse() => _controller.Reverse();

        private void OnStateChanged(AnimationStatus status)
        {
            if (status == AnimationStatus.Dismissed)
                _overlay.Remove(this);
        }

        public override void Dispose()
        {
            _controller.Dispose();
            base.Dispose();
        }
    }

    /// <summary>
    /// 相当于Popup的占位，布局时不用再计算Popup
    /// </summary>
    internal sealed class PopupTransitionProxy : Widget
    {
        internal PopupTransitionProxy(Popup popup)
        {
            _popup = popup;
            _popup.Parent = this;
        }

        private readonly Popup _popup;

        public override void VisitChildren(Func<Widget, bool> action)
            => action(_popup);

        public override void Layout(float availableWidth, float availableHeight)
        {
            //popup已经布局过,只需要设置自身大小等于popup的大小
            SetSize(_popup.W, _popup.H);
        }

        protected override void OnUnmounted()
        {
            _popup.Parent = null;
            base.OnUnmounted();
        }
    }

    internal sealed class ScaleYTransition : Transform //TODO: 整合
    {
        public ScaleYTransition(Animation<double> animation, Offset? origin = null)
            : base(Matrix4.CreateScale(1, (float)(animation.Value), 1), origin)
        {
            _animation = animation;
            _animation.ValueChanged += OnAnimationValueChanged;
        }

        private readonly Animation<double> _animation;

        private void OnAnimationValueChanged() =>
            SetTransform(Matrix4.CreateScale(1, (float)_animation.Value, 1));
    }
}