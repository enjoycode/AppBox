using AppBoxDesign.AI;
using CodeEditor;
using PixUI;

namespace AppBoxDesign;

internal sealed class AIGeneratePad : View
{
    public AIGeneratePad(DesignStore designStore)
    {
        _designStore = designStore;
        _notRunning = _running.ToReversed();

        Child = new Column()
        {
            Children =
            [
                BuildActionBar(),

                new CodeEditorWidget(_textController)
            ],
        };

        _textController.Document.Open("Write prompt here.");
    }

    private readonly DesignStore _designStore;
    private readonly State<bool> _running = false;
    private readonly State<bool> _notRunning;

    private readonly CodeEditorController _textController =
        new("AIPrompt.md", new ImmutableTextBuffer(), new PureTextSyntaxParser());

    private Container BuildActionBar() => new Container()
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
                        new Button("Send Prompt", MaterialIcons.Message)
                            { Enabled = _notRunning, OnTap = _ => SendPrompt() },
                        new Button("Clear Prompt", MaterialIcons.Clear)
                            { Enabled = _notRunning, OnTap = _ => ClearPrompt() },
                        new Button("Reset Chat", MaterialIcons.LockReset) { Enabled = _notRunning }
                    ]
                },
                // new ButtonGroup()
                // {
                //     Children = [
                //         new Button("Undo History", MaterialIcons.Undo) { Enabled = _notRunning },
                //     ]
                // }
            ]
        }
    };

    private void ClearPrompt() => _textController.Replace(0, _textController.Document.TextLength, "");

    private async void SendPrompt()
    {
        var activeDesigner = _designStore.ActiveDesigner;
        if (activeDesigner is not IAIGeneratable aiGenerator)
        {
            Notification.Error("Not support for AI");
            return;
        }

        var prompt = _textController.Document.TextContent;
        if (string.IsNullOrEmpty(prompt))
        {
            Notification.Error("Please enter a valid prompt");
            return;
        }

        _running.Value = true;
        try
        {
            await aiGenerator.Chat.SendUserPrompt(prompt);
        }
        catch (Exception e)
        {
            Notification.Error(e.Message);
        }
        finally
        {
            _running.Value = false;
        }
    }
}

internal sealed class PureTextSyntaxParser : ISyntaxParser
{
    private int _editStartOffset;
    private int _editEndOffset;

    public void Dispose() { }
    public bool HasSyntaxError => false;

    public Document Document { get; set; } = null!;

    public void BeginEdit(int offset, int length, int textLength) { }

    public void EndEdit(int offset, int length, int textLength)
    {
        _editStartOffset = offset;
        if (length == 0 && textLength > 0) //insert
            _editEndOffset = offset + textLength;
        else if (length > 0 && textLength == 0) //remove
            _editEndOffset = offset;
        else //replace
            _editEndOffset = offset + textLength;
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