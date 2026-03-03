using CodeEditor;
using PixUI;

namespace AppBoxDesign;

internal sealed class AIGeneratePad : View
{
    public AIGeneratePad(DesignStore designStore)
    {
        _designStore = designStore;

        Child = new Column()
        {
            Children =
            [
                BuildActionBar(),

                new CodeEditorWidget(_textController)
            ],
        };
    }

    private readonly DesignStore _designStore;

    private readonly CodeEditorController _textController =
        new("AI.md", new ImmutableTextBuffer(), new PureTextSyntaxParser());

    private Widget BuildActionBar() => new Container()
    {
        Height = 40,
        Padding = EdgeInsets.Only(15, 5, 15, 5),
        Child = new Row(VerticalAlignment.Middle, 10)
        {
            Children =
            [
                new ButtonGroup()
                {
                    Children =
                    [
                        new Button("Send", MaterialIcons.Message),
                        new Button("Undo", MaterialIcons.Undo),
                        new Button("Clear", MaterialIcons.Clear),
                    ]
                },
            ]
        }
    };

    protected override void OnMounted()
    {
        base.OnMounted();
        _textController.Document.Open("Write prompt here.");
    }
}

internal sealed class PureTextSyntaxParser : CodeEditor.ISyntaxParser
{
    private int _editStartOffset;
    private int _editEndOffset;

    public void Dispose() { }
    public bool HasSyntaxError => false;

    public Document Document { get; set; }

    public void BeginEdit(int offset, int length, int textLength) { }

    public void EndEdit(int offset, int length, int textLength)
    {
        _editStartOffset = offset;
        if (length == 0 && textLength > 0) //insert
            _editEndOffset = offset + textLength;
        else if (length > 0 && textLength == 0) //remove
            _editEndOffset = offset;
        else //replace
            _editEndOffset = offset + (textLength - length);
    }

    public char? GetAutoClosingPairs(char ch) => null;

    public bool IsBlockStartBracket(char ch) => false;

    public bool IsBlockEndBracket(char ch) => false;

    public ValueTask<(int, int)> ParseAndTokenize()
    {
        var startLine = Document.GetLineNumberByOffset(_editStartOffset);
        var endLine = Document.GetLineNumberByOffset(_editEndOffset);

        for (var line = startLine; line <= endLine; line++)
        {
            var lineSegment = Document.GetLineSegment(line);
            lineSegment.ClearCachedParagraph();
            // lineSegment.BeginTokenize();
            // lineSegment.EndTokenize();
        }

        return new ValueTask<(int, int)>((startLine, endLine));
    }
}