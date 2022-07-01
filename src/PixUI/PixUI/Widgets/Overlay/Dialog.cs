using System;

namespace PixUI
{
    public abstract class Dialog<T> : Popup
    {
        private Card? _child;
        protected readonly State<string> Title = "";
        protected Action<bool, T?>? OnClose;

        protected Dialog(Overlay overlay, Action<bool, T?>? onClose = null) :
            base(overlay)
        {
            OnClose = onClose;
            //注意不在这里构建WidgetTree,参照以下OnMounted时的说明
        }

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
            if (_child == null)
            {
                _child = new Card()
                {
                    Elevation = 20,
                    Child = new Column()
                    {
                        Children = new Widget[]
                        {
                            BuildTitle(),
                            BuildBody(),
                        }
                    }
                };
                _child.Parent = this;
            }

            base.OnMounted();
        }

        public override void VisitChildren(Func<Widget, bool> action) => action(_child!);

        public override void Layout(float availableWidth, float availableHeight)
        {
            _child!.Layout(Width?.Value ?? availableWidth, Height?.Value ?? availableHeight);

            //设置child居中
            _child.SetPosition((availableWidth - _child.W) / 2, (availableHeight - _child.H) / 2);

            //注意自身宽高无限
            SetSize(float.PositiveInfinity, float.PositiveInfinity);
        }

        #endregion
    }
}