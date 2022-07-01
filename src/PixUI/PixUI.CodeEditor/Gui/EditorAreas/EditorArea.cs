using PixUI;

namespace CodeEditor
{
    internal abstract class EditorArea
    {
        protected EditorArea(TextEditor textEditor)
        {
            TextEditor = textEditor;
        }

        protected TextEditorTheme Theme => TextEditor.Theme;

        protected Document Document => TextEditor.Document;

        internal readonly TextEditor TextEditor;

        /// <summary>
        /// 在整个代码编辑器内的区域
        /// </summary>
        internal virtual Rect Bounds { get; set; } = Rect.Empty;

        internal virtual bool IsVisible => true;

        internal virtual Size Size => new Size(-1, -1);

        internal virtual void HandlePointerDown(float x, float y, PointerButtons buttons) { }

        internal abstract void Paint(Canvas canvas, Rect rect);
    }
}