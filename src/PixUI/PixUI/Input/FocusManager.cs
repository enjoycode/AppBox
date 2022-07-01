using System;

namespace PixUI
{
    public sealed class FocusManager
    {
        public Widget? FocusedWidget { get; private set; }

        public void Focus(Widget? widget)
        {
            if (ReferenceEquals(FocusedWidget, widget))
                return; //Already focused

            if (FocusedWidget != null)
            {
                ((IFocusable)FocusedWidget).FocusNode.RaiseFocusChanged(false);
                FocusedWidget = null;
            }

            if (widget is IFocusable)
            {
                FocusedWidget = widget;
                ((IFocusable)FocusedWidget).FocusNode.RaiseFocusChanged(true);
            }
        }

        internal void OnKeyDown(KeyEvent e)
        {
            //TODO:考虑FocusedWidget==null时且为Tab从根节点开始查找Focusable
            if (FocusedWidget == null) return;
            PropagateEvent<KeyEvent>(FocusedWidget, e,
                (w, e) => ((IFocusable)w).FocusNode.RaiseKeyDown(e));
            //如果是Tab键跳转至下一个Focused
            if (!e.IsHandled && e.KeyCode == Keys.Tab)
            {
                var forward = !e.Shift;
                Widget? found;
                if (forward)
                    found = FindFocusableForward(FocusedWidget.Parent!, FocusedWidget);
                else
                    found = FindFocusableBackward(FocusedWidget.Parent!, FocusedWidget);
                if (found != null)
                    Focus(found);
            }
        }

        internal void OnKeyUp(KeyEvent e)
        {
            if (FocusedWidget == null) return;
            PropagateEvent<KeyEvent>(FocusedWidget, e,
                (w, e) => ((IFocusable)w).FocusNode.RaiseKeyUp(e));
        }

        internal void OnTextInput(string text)
        {
            ((IFocusable)FocusedWidget!).FocusNode.RaiseTextInput(text);
        }

        private static void PropagateEvent<T>(Widget? widget, T theEvent,
            Action<Widget, T> handler) where T : PropagateEvent
        {
            while (true)
            {
                if (widget == null) return;

                if (widget is IFocusable)
                {
                    handler(widget, theEvent);
                    if (theEvent.IsHandled) return;
                }

                widget = widget.Parent;
            }
        }

        private static Widget? FindFocusableForward(Widget container, Widget? start)
        {
            //start == null 表示向下
            Widget? found = null;
            var hasStart = start == null;
            container.VisitChildren(c =>
            {
                if (!hasStart)
                {
                    if (ReferenceEquals(c, start))
                        hasStart = true;
                }
                else
                {
                    if (c is IFocusable)
                    {
                        found = c;
                        return true;
                    }

                    var childFocused = FindFocusableForward(c, null);
                    if (childFocused != null)
                    {
                        found = childFocused;
                        return true;
                    }
                }

                return false;
            });

            if (found != null || start == null) return found;
            //继续向上
            if (container.Parent != null && !(container.Parent is IRootWidget))
                return FindFocusableForward(container.Parent!, container);
            return null;
        }

        private static Widget? FindFocusableBackward(Widget container, Widget? start)
        {
            //start == null 表示向下
            Widget? found = null;
            container.VisitChildren(c =>
            {
                if (start != null && ReferenceEquals(c, start))
                    return true;

                if (c is IFocusable)
                {
                    found = c; //Do not break, continue
                }
                else
                {
                    var childFocused = FindFocusableForward(c, null);
                    if (childFocused != null)
                    {
                        found = childFocused; //Do not break, continue
                    }
                }

                return false;
            });

            if (found != null || start == null) return found;
            //继续向上
            if (container.Parent != null && !(container.Parent is IRootWidget))
                return FindFocusableBackward(container.Parent!, container);
            return null;
        }
    }
}