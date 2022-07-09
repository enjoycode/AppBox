using System;

namespace PixUI
{
    public abstract class Dialog<T> : Popup
    {
        protected Dialog(Overlay overlay, Action<bool, T?>? onClose = null) :
            base(overlay)
        {
            OnClose = onClose;
            //注意不在这里构建WidgetTree,参照以下OnMounted时的说明
        }

        private Card? _child;
        protected readonly State<string> Title = "";
        protected Action<bool, T?>? OnClose;
        protected sealed override bool IsDialog => true;

        private Widget BuildTitle()
        {
            return new Row()
            {
                Height = 25,
                Children = new Widget[]
                {
                    new Container() { Width = 35 }, //TODO: SizeBox
                    new Expanded()
                    {
                        Child = new Center() { Child = new Text(Title) }
                    },
                    new Button(null, Icons.Filled.Close)
                    {
                        Style = ButtonStyle.Transparent,
                        OnTap = _ => Close(true),
                    },
                }
            };
        }

        protected abstract Widget BuildBody();

        protected abstract T? GetResult(bool canceled);

        public void Show()
            => base.Show(null, null, DialogTransitionBuilder);

        public void Close(bool canceled)
        {
            Hide();
            OnClose?.Invoke(canceled, GetResult(canceled));
        }

        #region ====Overrides====

        protected override void OnMounted()
        {
            //由于转换为Web后，继承自Dialog构造的初始化顺序问题, 所以在这里构建WidgetTree
            // class SomeDialog extends Dialog<string> {
            //      private State<string> _someState = "Hello";
            //      constructor(overlay: Overlay) {
            //          super(overlay); //如果在这里构建WidgetTree,则_someState为undefined
            //      }
            // }
            TryBuildChild();
            base.OnMounted();
        }

        private void TryBuildChild()
        {
            if (_child != null) return;

            _child = new Card()
            {
                Elevation = 20,
                Child = new Column()
                {
                    Children = new[]
                    {
                        BuildTitle(),
                        BuildBody(),
                    }
                }
            };
            _child.Parent = this;
        }

        public override void VisitChildren(Func<Widget, bool> action) => action(_child!);

        public override bool ContainsPoint(float x, float y) => true;

        protected internal override bool HitTest(float x, float y, HitTestResult result)
        {
            //always hit dialog
            result.Add(this);
            HitTestChild(_child!, x, y, result);
            return true;
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            TryBuildChild();
            _child!.Layout(Width?.Value ?? availableWidth, Height?.Value ?? availableHeight);
            //不用设置_child位置,显示时设置自身位置，另外不能设置自身大小为无限，因为弹出动画需要
            SetSize(_child.W, _child.H);
        }

        #endregion
    }
}