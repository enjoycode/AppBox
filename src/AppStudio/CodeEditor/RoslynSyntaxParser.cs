using System.Collections.Frozen;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using CodeEditor;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Classification;
using Microsoft.CodeAnalysis.Text;
using PixUI;

namespace AppBoxDesign;

internal sealed class RoslynSyntaxParser : ISyntaxParser
{
    public RoslynSyntaxParser(RoslynSourceText textBuffer)
    {
        _textBuffer = textBuffer;
    }

    private readonly RoslynSourceText _textBuffer;
    private readonly SyntaxDiffer _syntaxDiffer = new();

    // private List<SourceText> _changes = [];
    private SyntaxTree? _oldTree;

    #region ====TokenType Map====

    private static readonly FrozenDictionary<string, TokenType> TokenTypes = new Dictionary<string, TokenType>
    {
        [ClassificationTypeNames.ClassName] = TokenType.Type,
        [ClassificationTypeNames.WhiteSpace] = TokenType.WhiteSpace,
        [ClassificationTypeNames.RecordClassName] = TokenType.Type,
        [ClassificationTypeNames.RecordStructName] = TokenType.Type,
        [ClassificationTypeNames.StructName] = TokenType.Type,
        [ClassificationTypeNames.InterfaceName] = TokenType.Type,
        [ClassificationTypeNames.DelegateName] = TokenType.Type,
        [ClassificationTypeNames.EnumName] = TokenType.Type,
        [ClassificationTypeNames.ModuleName] = TokenType.Module,
        [ClassificationTypeNames.TypeParameterName] = TokenType.Type,
        [ClassificationTypeNames.MethodName] = TokenType.Function,
        [ClassificationTypeNames.ExtensionMethodName] = TokenType.Function,
        [ClassificationTypeNames.ParameterName] = TokenType.Variable,
        [ClassificationTypeNames.Comment] = TokenType.Comment,
        // [ClassificationTypeNames.StaticSymbol] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentAttributeName] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentAttributeQuotes] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentAttributeValue] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentCDataSection] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentComment] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentDelimiter] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentEntityReference] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentName] = TokenType.Unknown,
        // [ClassificationTypeNames.XmlDocCommentProcessingInstruction] = TokenType.Unknown,
        [ClassificationTypeNames.XmlDocCommentText] = TokenType.Comment,
        [ClassificationTypeNames.Keyword] = TokenType.Keyword,
        [ClassificationTypeNames.ControlKeyword] = TokenType.Keyword,
        [ClassificationTypeNames.PreprocessorKeyword] = TokenType.Unknown,
        [ClassificationTypeNames.StringLiteral] = TokenType.LiteralString,
        [ClassificationTypeNames.VerbatimStringLiteral] = TokenType.LiteralString,
        [ClassificationTypeNames.NumericLiteral] = TokenType.LiteralNumber,
        [ClassificationTypeNames.Operator] = TokenType.Operator,
        [ClassificationTypeNames.OperatorOverloaded] = TokenType.Operator,
        [ClassificationTypeNames.ConstantName] = TokenType.Constant,
        // [AdditionalClassificationTypeNames.BraceMatching] = BraceMatchingBrush.AsFrozen()
    }.ToFrozenDictionary();

    #endregion

    public void Dispose() { }

    public bool HasSyntaxError { get; }

    public CodeEditor.Document Document { get; set; } = null!;

    public void BeginEdit(int offset, int length, int textLength) { }

    public void EndEdit(int offset, int length, int textLength)
    {
        // var doc = _textBuffer.GetRoslynDocument();
        // if (!ReferenceEquals(_textBuffer.CurrentVersion, doc.GetTextAsync().Result))
        //     throw new InvalidOperationException();
        // _changes.Add(_textBuffer.CurrentVersion);
    }

    public char? GetAutoClosingPairs(char ch) => ch switch
    {
        '{' => '}',
        '[' => ']',
        '(' => ')',
        '"' => '"',
        '\'' => '\'',
        _ => null
    };

    public bool IsBlockStartBracket(char ch) => ch == '{';

    public bool IsBlockEndBracket(char ch) => ch == '}';

    public async ValueTask<(int, int)> ParseAndTokenize()
    {
        // var changes = _changes;
        // _changes = [];
        int beginLine;
        int endLine;
#if DEBUG
        var ts = Stopwatch.GetTimestamp();
#endif

        var doc = _textBuffer.GetRoslynDocument();
        var newTree = await doc.GetSyntaxTreeAsync();
        if (_oldTree != null)
        {
            var (b, e) = GetChangedRange(_oldTree, newTree!);
            beginLine = b;
            endLine = e;
        }
        else
        {
            beginLine = 0;
            endLine = Document.TotalNumberOfLines;
        }

        await BuildLineTokens(doc, beginLine, endLine);
        _oldTree = newTree;

#if DEBUG
        var ms = Stopwatch.GetElapsedTime(ts).TotalMilliseconds;
        Log.Debug($"ParseAndTokenize: {ms}ms");
#endif

        return (beginLine, endLine);
    }

    private (int, int) GetChangedRange(SyntaxTree oldTree, SyntaxTree newTree)
    {
        var start = Document.TextLength;
        var end = 0;
        var changes = _syntaxDiffer.GetChanges(oldTree, newTree);
        foreach (var change in changes)
        {
            if (change.NewNodes == null)
            {
                start = Math.Min(start, change.Range.Span.Start);
                end = Math.Max(end, change.Range.Span.Start + change.Range.NewLength);
            }
            else
            {
                foreach (var node in change.NewNodes)
                {
                    start = Math.Min(start, node.FullSpan.Start);
                    end = Math.Max(end, node.FullSpan.End);
                }
            }
        }

        var startLine = Document.GetLineNumberByOffset(start);
        var endLine = Document.GetLineNumberByOffset(end);
        if (startLine == endLine)
            endLine += 1;

#if DEBUG
        Log.Debug($"合并的变更范围: [{startLine + 1} - {endLine + 1})");
#endif

        return (startLine, endLine);
    }

    private async ValueTask BuildLineTokens(Microsoft.CodeAnalysis.Document roslynDocument, int beginLine, int endLine)
    {
        for (var i = beginLine; i < endLine; i++)
        {
            var line = Document.GetLineSegment(i); //TODO: 优化
            // Console.WriteLine(Document.GetText(line.Offset, line.Length));
            var tokens = await Classifier.GetClassifiedSpansAsync(roslynDocument,
                new TextSpan(line.Offset, line.Length), CancellationToken.None);

            line.BeginTokenize();
            foreach (var token in tokens)
            {
                AddTokenToLine(line, token);
            }

            line.EndTokenize();
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static void AddTokenToLine(LineSegment line, ClassifiedSpan span)
    {
        var tokenType = TokenTypes.GetValueOrDefault(span.ClassificationType, TokenType.Unknown);
        // 注意ClassifiedSpan会跨行
        line.AddToken(tokenType, Math.Max(span.TextSpan.Start, line.Offset),
            Math.Min(span.TextSpan.Length, line.Length));
    }

    #region ====Backup====

    // private static TextChangeRange GetEncompassingTextChangeRange(SourceText newText, SourceText oldText)
    // {
    //     var ranges = newText.GetChangeRanges(oldText);
    //     if (ranges.Count == 0)
    //         return default;
    //
    //     // simple case.
    //     if (ranges.Count == 1)
    //         return ranges[0];
    //
    //     return TextChangeRange.Collapse(ranges);
    // }

    // private static SyntaxNode? GetContainingMemberDeclaration(SyntaxNode root, int position, bool useFullSpan = true)
    //     => GetContainingMemberDeclaration<MemberDeclarationSyntax>(root, position, useFullSpan);

    // private static SyntaxNode? GetContainingMethodDeclaration(SyntaxNode root, int position, bool useFullSpan = true)
    //     => GetContainingMemberDeclaration<BaseMethodDeclarationSyntax>(root, position, useFullSpan);

    // private static SyntaxNode? GetContainingMemberDeclaration<TMemberDeclarationSyntax>(SyntaxNode root, int position,
    //     bool useFullSpan = true)
    //     where TMemberDeclarationSyntax : MemberDeclarationSyntax
    // {
    //     var end = root.FullSpan.End;
    //     if (end == 0)
    //     {
    //         // empty file
    //         return null;
    //     }
    //
    //     // make sure position doesn't touch end of root
    //     position = Math.Min(position, end - 1);
    //
    //     var node = root.FindToken(position).Parent;
    //     while (node != null)
    //     {
    //         if (useFullSpan || node.Span.Contains(position))
    //         {
    //             var kind = node.Kind();
    //             if ((kind != SyntaxKind.GlobalStatement) && (kind != SyntaxKind.IncompleteMember) &&
    //                 (node is TMemberDeclarationSyntax))
    //             {
    //                 return node;
    //             }
    //         }
    //
    //         node = node.Parent;
    //     }
    //
    //     return null;
    // }

    #endregion
}