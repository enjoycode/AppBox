using System.Runtime.InteropServices;

namespace CodeEditor
{
    [StructLayout(LayoutKind.Sequential)]
    public readonly struct TSPoint
    {
        public static readonly TSPoint Empty = new TSPoint(0, 0);

        public readonly uint row;

        public readonly uint column;

        public TSPoint(int row, int column)
        {
            this.row = (uint)row;
            this.column = (uint)column;
        }

        public TSPoint Clone() => new TSPoint((int)row, (int)column);

        internal static TSPoint FromLocation(TextLocation location)
            => new TSPoint(location.Line, location.Column * SyntaxParser.ParserEncoding);

        public override string ToString() => $"({row}, {column})";
    }
}