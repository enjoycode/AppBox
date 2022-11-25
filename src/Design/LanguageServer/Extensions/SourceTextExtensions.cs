using Microsoft.CodeAnalysis.Text;

namespace AppBoxDesign;

public static class SourceTextExtensions
{
    /// <summary>
    /// Converts a line number and offset to a zero-based position within a <see cref="SourceText"/>.
    /// </summary>
    public static int GetPositionFromLineAndOffset(this SourceText text, int lineNumber, int offset)
        => text.Lines[lineNumber].Start + offset;
}