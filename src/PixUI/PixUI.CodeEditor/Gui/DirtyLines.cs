using System;
using PixUI;

namespace CodeEditor
{
    /// <summary>
    /// 需要重新绘制的行范围[StartLine, EndLine)
    /// </summary>
    internal sealed class DirtyLines : IDirtyArea
    {
        internal DirtyLines(CodeEditorController controller)
        {
            _controller = controller;
        }

        private readonly CodeEditorController _controller;
        internal int StartLine;
        internal int EndLine;

        public void Merge(IDirtyArea? newArea)
        {
            //TODO:
        }

        public Rect GetRect()
        {
            //TODO:暂返回TextArea的范围，考虑仅行范围
            return _controller.TextEditor.TextView.Bounds;
        }

        public IDirtyArea ToChild(float childX, float childY)
        {
            throw new NotSupportedException();
        }
    }
}