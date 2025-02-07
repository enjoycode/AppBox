using AppBoxClient;
using AppBoxCore;
using CodeEditor;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Formatting;
using Microsoft.CodeAnalysis.Formatting;
using Microsoft.CodeAnalysis.Options;

namespace AppBoxDesign;

internal static class FormatDocumentCommand
{
    public static async void Execute(TextEditor editor)
    {
        ModelId modelId = editor.Document.Tag!;
        var hub = DesignHub.Current;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        var opts = GetFormatOptions(hub.TypeSystem.Workspace.Options); //TODO: cache OptionSet?
        var newDoc = await Formatter.FormatAsync(doc, opts).ConfigureAwait(false);
        var changes = await newDoc.GetTextChangesAsync(doc).ConfigureAwait(false);
        var res = changes
            .OrderByDescending(c => c.Span).ToList();

        //TODO:暂逐个处理，另UpdateCaretPosition至有效位置
        editor.Document.StartUndoGroup();
        foreach (var change in res)
        {
            editor.Document.Replace(change.Span.Start, change.Span.Length, change.NewText ?? string.Empty);
        }

        editor.Document.EndUndoGroup();
    }

    private static OptionSet GetFormatOptions(OptionSet optionSet)
    {
        //https://github.com/dotnet/roslyn/issues/8269 collection initializers not supported now.
        return optionSet
                .WithChangedOption(FormattingOptions.NewLine, LanguageNames.CSharp, "\n")
                .WithChangedOption(FormattingOptions.UseTabs, LanguageNames.CSharp, false)
                .WithChangedOption(FormattingOptions.TabSize, LanguageNames.CSharp, 4)
                .WithChangedOption(FormattingOptions.SmartIndent, LanguageNames.CSharp,
                    FormattingOptions.IndentStyle.Smart)
                .WithChangedOption(FormattingOptions.IndentationSize, LanguageNames.CSharp, 4)
                // .WithChangedOption(CSharpFormattingOptions.SpacingAfterMethodDeclarationName, formattingOptions.SpacingAfterMethodDeclarationName)
                // .WithChangedOption(CSharpFormattingOptions.SpaceWithinMethodDeclarationParenthesis, formattingOptions.SpaceWithinMethodDeclarationParenthesis)
                // .WithChangedOption(CSharpFormattingOptions.SpaceBetweenEmptyMethodDeclarationParentheses, formattingOptions.SpaceBetweenEmptyMethodDeclarationParentheses)
                // .WithChangedOption(CSharpFormattingOptions.SpaceAfterMethodCallName, formattingOptions.SpaceAfterMethodCallName)
                // .WithChangedOption(CSharpFormattingOptions.SpaceWithinMethodCallParentheses, formattingOptions.SpaceWithinMethodCallParentheses)
                // .WithChangedOption(CSharpFormattingOptions.SpaceBetweenEmptyMethodCallParentheses, formattingOptions.SpaceBetweenEmptyMethodCallParentheses)
                // .WithChangedOption(CSharpFormattingOptions.SpaceAfterControlFlowStatementKeyword, formattingOptions.SpaceAfterControlFlowStatementKeyword)
                // .WithChangedOption(CSharpFormattingOptions.SpaceWithinExpressionParentheses, formattingOptions.SpaceWithinExpressionParentheses)
                // .WithChangedOption(CSharpFormattingOptions.SpaceWithinCastParentheses, formattingOptions.SpaceWithinCastParentheses)
                // .WithChangedOption(CSharpFormattingOptions.SpaceWithinOtherParentheses, formattingOptions.SpaceWithinOtherParentheses)
                // .WithChangedOption(CSharpFormattingOptions.SpaceAfterCast, formattingOptions.SpaceAfterCast)
                // .WithChangedOption(CSharpFormattingOptions.SpaceBeforeOpenSquareBracket, formattingOptions.SpaceBeforeOpenSquareBracket)
                // .WithChangedOption(CSharpFormattingOptions.SpaceBetweenEmptySquareBrackets, formattingOptions.SpaceBetweenEmptySquareBrackets)
                // .WithChangedOption(CSharpFormattingOptions.SpaceWithinSquareBrackets, formattingOptions.SpaceWithinSquareBrackets)
                .WithChangedOption(CSharpFormattingOptions.SpaceAfterColonInBaseTypeDeclaration, true)
                .WithChangedOption(CSharpFormattingOptions.SpaceAfterComma, true)
                // .WithChangedOption(CSharpFormattingOptions.SpaceAfterDot, formattingOptions.SpaceAfterDot)
                .WithChangedOption(CSharpFormattingOptions.SpaceAfterSemicolonsInForStatement, true)
                .WithChangedOption(CSharpFormattingOptions.SpaceBeforeColonInBaseTypeDeclaration, true)
                // .WithChangedOption(CSharpFormattingOptions.SpaceBeforeComma, formattingOptions.SpaceBeforeComma)
                // .WithChangedOption(CSharpFormattingOptions.SpaceBeforeDot, formattingOptions.SpaceBeforeDot)
                // .WithChangedOption(CSharpFormattingOptions.SpaceBeforeSemicolonsInForStatement, formattingOptions.SpaceBeforeSemicolonsInForStatement)
                .WithChangedOption(CSharpFormattingOptions.SpacingAroundBinaryOperator,
                    BinaryOperatorSpacingOptions.Single)
                // .WithChangedOption(CSharpFormattingOptions.IndentBraces, false)
                .WithChangedOption(CSharpFormattingOptions.IndentBlock, true)
                .WithChangedOption(CSharpFormattingOptions.IndentSwitchSection, true)
                .WithChangedOption(CSharpFormattingOptions.IndentSwitchCaseSection, true)
                .WithChangedOption(CSharpFormattingOptions.IndentSwitchCaseSectionWhenBlock, true)
                .WithChangedOption(CSharpFormattingOptions.LabelPositioning, LabelPositionOptions.OneLess)
                .WithChangedOption(CSharpFormattingOptions.WrappingPreserveSingleLine, true)
                .WithChangedOption(CSharpFormattingOptions.WrappingKeepStatementsOnSingleLine, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInTypes, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInMethods, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInProperties, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInAccessors, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInAnonymousMethods, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInControlBlocks, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInAnonymousTypes, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInObjectCollectionArrayInitializers, true)
                .WithChangedOption(CSharpFormattingOptions.NewLinesForBracesInLambdaExpressionBody, true)
                .WithChangedOption(CSharpFormattingOptions.NewLineForElse, true)
                .WithChangedOption(CSharpFormattingOptions.NewLineForCatch, true)
                .WithChangedOption(CSharpFormattingOptions.NewLineForFinally, true)
                .WithChangedOption(CSharpFormattingOptions.NewLineForMembersInObjectInit, true)
                .WithChangedOption(CSharpFormattingOptions.NewLineForMembersInAnonymousTypes, true)
                .WithChangedOption(CSharpFormattingOptions.NewLineForClausesInQuery, true)
            ;
    }
}