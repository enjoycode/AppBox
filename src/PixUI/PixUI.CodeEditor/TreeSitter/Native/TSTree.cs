#if !__WEB__
using System;
using static CodeEditor.TreeSitterApi;

namespace CodeEditor
{
    public sealed class TSTree : IDisposable
    {
        internal IntPtr Handle { get; }

        internal TSTree(IntPtr handle)
        {
            Handle = handle;
        }

        public TSTree Copy()
        {
            return new TSTree(ts_tree_copy(Handle));
        }

        public TSSyntaxNode Root => TSSyntaxNode.Create(ts_tree_root_node(Handle))!;

        internal void Edit(ref TSEdit edit) => ts_tree_edit(Handle, ref edit);

        public void Dispose()
        {
            ts_tree_delete(Handle);
        }
    }
}
#endif