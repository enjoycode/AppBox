#if !__WEB__
using System;
using System.Runtime.InteropServices;

namespace CodeEditor
{
    internal enum TsInputEncoding
    {
        Utf8,
        Utf16
    }

    internal enum TsSymbolType
    {
        Regular,
        Anonymous,
        Auxiliary
    }

    internal delegate IntPtr TsReadDelegate(IntPtr payload, uint byteIndex, TSPoint position,
        out uint bytesRead);

    [StructLayout(LayoutKind.Sequential)]
    internal struct TSInput
    {
        public IntPtr payload;
        public TsReadDelegate read;
        public TsInputEncoding encoding;
    }

    internal enum TsLogType
    {
        Parse,
        Lex
    }

    internal delegate void TsLogDelegate(IntPtr payload, TsLogType logType, IntPtr data);

    [StructLayout(LayoutKind.Sequential)]
    internal struct TsLogger
    {
        public IntPtr payload;
        public TsLogDelegate log;
    }

    [StructLayout(LayoutKind.Explicit, Size = 4 * 4 + 8 + 8)]
    internal struct TsNode
    {
        [FieldOffset(4 * 4)] public IntPtr id;
        [FieldOffset(4 * 4 + 8)] public IntPtr tree;
    }

    [StructLayout(LayoutKind.Explicit, Size = 8 + 8 + 2 * 4)]
    internal struct TsTreeCursor
    {
        [FieldOffset(0)] public IntPtr tree;
        [FieldOffset(8)] public IntPtr id;
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct QueryCapture
    {
        public TsNode node;
        public uint index;
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct TsQueryMatch
    {
        public uint id;
        public ushort pattern_index;
        public ushort capture_count;
        public IntPtr captures;

        public override string ToString() =>
            $"TsQueryMatch[Id={id}, PatternIndex={pattern_index}, CaptureCount={capture_count}]";
    }

    public enum TsQueryPredicateStepType
    {
        Done,
        Capture,
        String,
    };

    [StructLayout(LayoutKind.Sequential)]
    public struct TsQueryPredicateStep
    {
        TsQueryPredicateStepType type;
        uint value_id;
    }

    internal enum TsQueryError
    {
        None = 0,
        Syntax,
        NodeType,
        Field,
        Capture,
    }

    internal static class TreeSitterApi
    {
        private const string LibTreeSitter = "tree-sitter";

        #region ====Parser====

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_parser_new();

        [DllImport(LibTreeSitter)]
        internal static extern void ts_parser_delete(IntPtr parser);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_parser_set_language(IntPtr self, IntPtr language);

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_parser_language(IntPtr self);

        [DllImport(LibTreeSitter)]
        internal static extern void ts_parser_set_included_ranges(
            IntPtr self,
            [MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 2)]
            TSRange[] ranges,
            uint length);

        [DllImport(LibTreeSitter)]
        [return: MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 1)]
        internal static extern TSRange[] ts_parser_included_ranges(
            IntPtr self,
            out uint length);

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_parser_parse(
            IntPtr self,
            IntPtr oldTree,
            TSInput input
        );

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_parser_parse_string(
            IntPtr self,
            IntPtr oldTree,
            IntPtr input,
            uint length
        );

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_parser_parse_string_encoding(
            IntPtr self,
            IntPtr oldTree,
            IntPtr input,
            uint length,
            TsInputEncoding encoding
        );

        [DllImport(LibTreeSitter)]
        internal static extern void ts_parser_reset(
            IntPtr self
        );

        [DllImport(LibTreeSitter)]
        internal static extern void ts_parser_set_timeout_micros(
            IntPtr self,
            ulong timeout
        );

        [DllImport(LibTreeSitter)]
        internal static extern ulong ts_parser_timeout_micros(
            IntPtr self
        );

        [DllImport(LibTreeSitter)]
        internal static extern void ts_parser_set_cancellation_flag(
            IntPtr self,
            IntPtr flag
        );

        [DllImport(LibTreeSitter)]
        internal static extern void ts_parser_set_logger(
            IntPtr self,
            TsLogger logger
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsLogger ts_parser_get_logger(
            IntPtr self
        );

        [DllImport(LibTreeSitter)]
        internal static extern void ts_parser_print_dot_graphs(
            IntPtr self,
            int file
        );

        #endregion

        #region ====Tree====

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_tree_copy(
            IntPtr self
        );

        [DllImport(LibTreeSitter)]
        internal static extern void ts_tree_delete(
            IntPtr self
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_tree_root_node(
            IntPtr self
        );

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_tree_language(IntPtr self);

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_tree_edit(IntPtr self, ref TSEdit edit);

        [DllImport(LibTreeSitter)]
        internal static extern unsafe TSRange* ts_tree_get_changed_ranges(IntPtr oldTree,
            IntPtr newTree, ref uint length);

        #endregion

        #region ====Node====

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_node_type(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern ushort ts_node_symbol(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern uint ts_node_start_byte(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TSPoint ts_node_start_point(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern uint ts_node_end_byte(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TSPoint ts_node_end_point(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_node_string(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_node_is_null(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_node_is_named(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_node_is_missing(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_node_is_extra(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_node_has_changes(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_node_has_error(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_parent(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_child(TsNode node, uint index);

        [DllImport(LibTreeSitter)]
        internal static extern uint ts_node_child_count(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_named_child(TsNode node, uint index);

        [DllImport(LibTreeSitter)]
        internal static extern uint ts_node_named_child_count(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_child_by_field_name(
            TsNode node,
            IntPtr fieldName,
            uint fieldNameLength
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_child_by_field_id(
            TsNode node,
            ushort fieldId
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_next_sibling(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_prev_sibling(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_next_named_sibling(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_prev_named_sibling(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_first_child_for_byte(TsNode node, uint byteOffset);

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_first_named_child_for_byte(
            TsNode node,
            uint offset
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_descendant_for_byte_range(
            TsNode node,
            uint start,
            uint end
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_descendant_for_point_range(
            TsNode node,
            TSPoint start,
            TSPoint end
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_named_descendant_for_byte_range(
            TsNode node,
            uint start,
            uint end
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_node_named_descendant_for_point_range(
            TsNode node,
            TSPoint start,
            TSPoint end
        );


        [DllImport(LibTreeSitter)]
        internal static extern void ts_node_edit(TsNode node, ref TSEdit edit);


        [DllImport(LibTreeSitter)]
        internal static extern bool ts_node_eq(TsNode node, TsNode other);

        #endregion

        #region ====Tree Cursor====

        [DllImport(LibTreeSitter)]
        internal static extern TsTreeCursor ts_tree_cursor_new(TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern void ts_tree_cursor_delete(ref TsTreeCursor cursor);

        [DllImport(LibTreeSitter)]
        internal static extern TsTreeCursor ts_tree_cursor_reset(
            ref TsTreeCursor self,
            TsNode node
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsNode ts_tree_cursor_current_node(
            ref TsTreeCursor self
        );

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_tree_cursor_current_field_name(
            ref TsTreeCursor self
        );

        [DllImport(LibTreeSitter)]
        internal static extern ushort ts_tree_cursor_current_field_id(
            ref TsTreeCursor self
        );

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_tree_cursor_goto_parent(
            ref TsTreeCursor self
        );

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_tree_cursor_goto_next_sibling(
            ref TsTreeCursor self
        );

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_tree_cursor_goto_first_child(
            ref TsTreeCursor self
        );

        [DllImport(LibTreeSitter)]
        internal static extern ulong ts_tree_cursor_goto_first_child_for_byte(
            ref TsTreeCursor self,
            uint offset
        );

        [DllImport(LibTreeSitter)]
        internal static extern TsTreeCursor ts_tree_cursor_copy(
            ref TsTreeCursor self
        );

        #endregion

        #region ====Query====

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_query_new(IntPtr language, IntPtr source,
            uint sourceLength, ref uint errorOffset, ref TsQueryError errorType);

        [DllImport(LibTreeSitter)]
        internal static extern void ts_query_delete(IntPtr query);

        [DllImport(LibTreeSitter)]
        internal static extern uint ts_query_pattern_count(IntPtr query);

        [DllImport(LibTreeSitter)]
        internal static extern uint ts_query_capture_count(IntPtr query);

        [DllImport(LibTreeSitter)]
        internal static extern uint ts_query_string_count(IntPtr query);

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_query_capture_name_for_id(IntPtr query, uint id,
            ref uint length);

        [DllImport(LibTreeSitter)]
        internal static extern unsafe TsQueryPredicateStep* ts_query_predicates_for_pattern(
            IntPtr query, uint patternIndex, ref uint length);

        [DllImport(LibTreeSitter)]
        internal static extern IntPtr ts_query_cursor_new();

        [DllImport(LibTreeSitter)]
        internal static extern void ts_query_cursor_delete(IntPtr queryCursor);

        [DllImport(LibTreeSitter)]
        internal static extern void ts_query_cursor_set_match_limit(IntPtr queryCursor, uint limit);

        [DllImport(LibTreeSitter)]
        internal static extern void ts_query_cursor_set_point_range(IntPtr queryCursor,
            TSPoint start, TSPoint end);

        [DllImport(LibTreeSitter)]
        internal static extern void ts_query_cursor_exec(IntPtr queryCursor, IntPtr query,
            TsNode node);

        [DllImport(LibTreeSitter)]
        internal static extern bool ts_query_cursor_next_capture(IntPtr queryCursor,
            ref TsQueryMatch match, ref uint captureIndex);

        #endregion

        #region ====Language====

        [DllImport(LibTreeSitter)]
        public static extern uint ts_language_symbol_count(IntPtr language);

        [DllImport(LibTreeSitter)]
        public static extern IntPtr ts_language_symbol_name(
            IntPtr language,
            ushort symbol
        );

        [DllImport(LibTreeSitter)]
        public static extern ushort ts_language_symbol_for_name(
            IntPtr language,
            IntPtr name,
            uint length,
            bool isNamed
        );

        [DllImport(LibTreeSitter)]
        public static extern ushort ts_language_field_count(IntPtr language);

        [DllImport(LibTreeSitter)]
        public static extern IntPtr ts_language_field_name_for_id(
            IntPtr language,
            ushort fieldId
        );

        [DllImport(LibTreeSitter)]
        public static extern ushort ts_language_field_id_for_name(
            IntPtr language,
            IntPtr name,
            uint length
        );

        [DllImport(LibTreeSitter)]
        public static extern TsSymbolType ts_language_symbol_type(IntPtr language, ushort symbol);

        [DllImport(LibTreeSitter)]
        public static extern uint ts_language_version(IntPtr language);

        #endregion
    }
}
#endif