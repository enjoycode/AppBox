using System;

namespace PixUI
{
    public delegate Widget PopupTransitionBuilder(Animation<double> animation, Widget child,
        Offset? origin);

    public abstract class Popup : Widget, IEventHook
    {
        protected Popup(Overlay overlay)
        {
            Overlay = overlay;
        }

        internal new readonly Overlay Overlay;
        private PopupTransitionWrap? _transition;
        private PopupProxy? _proxy;

        /// <summary>
        /// 默认的沿Y缩放的打开动画
        /// </summary>
        public static readonly PopupTransitionBuilder DefaultTransitionBuilder =
            (animation, child, origin) => new ScaleYTransition(animation, origin)
            {
                Child = child
            };

        public void UpdatePosition(float x, float y)
        {
            SetPosition(x, y);
            Invalidate(InvalidAction.Repaint);
        }

        public void Show(Widget? relativeTo = null,
            Offset? relativeOffset = null, PopupTransitionBuilder? transitionBuilder = null)
        {
            Widget target = this;

            //先计算显示位置
            Offset? origin = null;
            var winX = 0f;
            var winY = 0f;
            if (relativeTo != null)
            {
                var winPt = relativeTo.LocalToWindow(0, 0);
                var offsetX = relativeOffset?.Dx ?? 0;
                var offsetY = relativeOffset?.Dy ?? 0;

                _proxy = new PopupProxy(this); //构建占位并计算布局
                target = _proxy;
                var popupHeight = H;
                //暂简单支持向下或向上弹出
                if (winPt.Y + relativeTo.H + offsetY + popupHeight > Overlay.Window.Height)
                {
                    //向上弹出
                    winX = winPt.X + offsetX;
                    winY = winPt.Y - offsetY - popupHeight;
                    origin = new Offset(0, popupHeight);
                }
                else
                {
                    //向下弹出
                    winX = winPt.X + offsetX;
                    winY = winPt.Y + relativeTo.H + offsetY;
                    //origin = new Offset(0, 0);
                }
            }

            if (transitionBuilder != null)
            {
                _proxy ??= new PopupProxy(this);
                _transition = new PopupTransitionWrap(Overlay, _proxy, origin, transitionBuilder);
                _transition.Forward();
                target = _transition;
            }

            if (relativeTo != null)
                target.SetPosition(winX, winY);
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
            else if (_proxy != null)
            {
                Overlay.Remove(_proxy);
                _proxy = null;
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
        internal PopupTransitionWrap(Overlay overlay, PopupProxy proxy, Offset? origin,
            PopupTransitionBuilder transitionBuilder)
        {
            _overlay = overlay;
            _controller = new AnimationController(100);
            _controller.StatusChanged += OnStateChanged;

            Child = transitionBuilder(_controller, proxy, origin);
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
    internal sealed class PopupProxy : Widget
    {
        internal PopupProxy(Popup popup)
        {
            //直接布局方便计算显示位置，后续不用再计算
            popup.Layout(popup.Overlay.Window.Width, popup.Overlay.Window.Height);

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