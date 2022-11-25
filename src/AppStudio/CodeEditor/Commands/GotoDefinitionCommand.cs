using AppBoxClient;
using CodeEditor;

namespace AppBoxDesign;

internal sealed class GotoDefinitionCommand : IEditCommand
{
    internal static readonly GotoDefinitionCommand Default = new ();
    
    public async void Execute(TextEditor editor)
    {
        var modelIdString = editor.Document.Tag!;
        var line = editor.Caret.Line;
        var column = editor.Caret.Column;

        var res = await Channel.Invoke<ReferenceVO?>("sys.DesignService.GotoDefinition",
            new object?[] { modelIdString, line, column });
        
        throw new System.NotImplementedException();
    }
}