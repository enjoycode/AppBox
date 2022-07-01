using System;

namespace PixUI
{
    public sealed class Input : Widget
    {
        public Input(State<string> text)
        {
            _editableText = new EditableText(text);
            _editableText.Parent = this;
            _focusedDecoration = new FocusedDecoration(this, GetFocusedBorder, GetUnFocusedBorder);
            _focusedDecoration.AttachFocusChangedEvent(_editableText);
        }

        private static readonly InputBorder DefaultBorder =
            new OutlineInputBorder(null, BorderRadius.All(Radius.Circular(4)));

        private Widget? _prefix;
        private Widget? _suffix;
        private readonly EditableText _editableText;

        private InputBorder? _border;
        private State<EdgeInsets>? _padding;

        private readonly FocusedDecoration _focusedDecoration;

        public State<EdgeInsets>? Padding
        {
            get => _padding;
            set => _padding = Rebind(_padding, value, BindingOptions.AffectsLayout);
        }

        public State<float>? FontSize
        {
            get => _editableText.FontSize;
            set => _editableText.FontSize = value;
        }

        public Widget? Prefix
        {
            get => _prefix;
            set
            {
                if (_prefix != null)
                    _prefix.Parent = null;

                _prefix = value;
                if (_prefix == null) return;

                _prefix.Parent = this;
                if (!IsMounted) return;
                Invalidate(InvalidAction.Relayout);
            }
        }

        public Widget? Suffix
        {
            get => _suffix;
            set
            {
                if (_suffix != null)
                    _suffix.Parent = null;

                _suffix = value;
                if (_suffix == null) return;

                _suffix.Parent = this;
                if (!IsMounted) return;
                Invalidate(InvalidAction.Relayout);
            }
        }

        public State<bool> Readonly
        {
            set => _editableText.Readonly = value;
        }

        public bool IsObscure
        {
            set => _editableText.IsObscure = value;
        }

        public string HintText
        {
            set => _editableText.HintText = value;
        }

        #region ====FocusedDecoration====

        private ShapeBorder? GetUnFocusedBorder() => _border ?? DefaultBorder;

        private ShapeBorder GetFocusedBorder()
        {
            //TODO: others
            var border = _border ?? DefaultBorder;
            if (border is OutlineInputBorder outline)
            {
                return new OutlineInputBorder(
                    new BorderSide(Theme.FocusedColor, Theme.FocusedBorderWidth),
                    outline.BorderRadius
                );
            }

            throw new NotImplementedException();
        }

        #endregion

        #region ====Overrides====

        protected override void OnUnmounted()
        {
            _focusedDecoration.StopAndReset();
            base.OnUnmounted();
        }

        public override void VisitChildren(Func<Widget, bool> action)
        {
            if (_prefix != null)
                if (action(_prefix))
                    return;

            if (action(_editableText)) return;

            if (_suffix != null)
                action(_suffix);
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            var width = CacheAndCheckAssignWidth(availableWidth);
            var height = CacheAndCheckAssignHeight(availableHeight);
            var padding = _padding?.Value ?? EdgeInsets.All(4);

            // 扣除padding的宽高
            var lw = width - padding.Horizontal;
            var lh = height - padding.Vertical;
            if (lw <= 0 || lh <= 0)
            {
                SetSize(width, height);
                return;
            }

            // 设置自身宽高
            var fontHeight = _editableText.FontHeight;
            height = Math.Min(height, fontHeight + padding.Vertical);
            SetSize(width, height);

            // prefix
            if (_prefix != null)
            {
                _prefix.Layout(lw, fontHeight);
                _prefix.SetPosition(padding.Left, padding.Top + (fontHeight - _prefix.H) / 2);
                lw -= _prefix.W;
            }

            // suffix
            if (_suffix != null)
            {
                _suffix.Layout(lw, fontHeight);
                _suffix.SetPosition(width - padding.Right - _suffix.W,
                    padding.Top + (fontHeight - _suffix.H) / 2);
                lw -= _suffix.W;
            }

            // editableText
            _editableText.Layout(lw, lh);
            _editableText.SetPosition(padding.Left + (_prefix?.W ?? 0), padding.Top);
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            // var padding = _padding?.Value ?? EdgeInsets.All(4);
            var bounds = Rect.FromLTWH(0, 0, W, H);
            var border = _border ?? DefaultBorder;

            //画背景及边框
            border.Paint(canvas, bounds,
                _editableText.IsReadonly ? new Color(0xFFF5F7FA) : Colors.White);

            PaintChildren(canvas, area);
        }

        #endregion
    }
}