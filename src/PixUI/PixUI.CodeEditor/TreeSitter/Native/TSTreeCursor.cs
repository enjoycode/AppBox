#if !__WEB__
using System;
using System.Runtime.InteropServices;
using static CodeEditor.TreeSitterApi;

namespace CodeEditor
{
    public sealed class TSTreeCursor : IDisposable
    {
        private TsTreeCursor _native;

        internal TSTreeCursor(TSSyntaxNode initial)
        {
            _native = ts_tree_cursor_new(initial.Handle);
        }

        public void Reset(TSSyntaxNode newNode)
        {
            ts_tree_cursor_reset(ref _native, newNode.Handle);
        }

        public bool GotoFirstChild()
        {
            return ts_tree_cursor_goto_first_child(ref _native);
        }

        public bool GotoNextSibling()
        {
            return ts_tree_cursor_goto_next_sibling(ref _native);
        }

        public bool GotoParent()
        {
            return ts_tree_cursor_goto_parent(ref _native);
        }

        public TSSyntaxNode Current => TSSyntaxNode.Create(ts_tree_cursor_current_node(ref _native));
        public ushort FieldId => ts_tree_cursor_current_field_id(ref _native);

        public string FieldName
        {
            get
            {
                var ptr = ts_tree_cursor_current_field_name(ref _native);
                return ptr == IntPtr.Zero ? null : Marshal.PtrToStringAnsi(ptr);
            }
        }

        public void Dispose()
        {
            ts_tree_cursor_delete(ref _native);
        }
    }
}
#endif