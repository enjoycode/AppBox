using CodeEditor;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class ViewDesigner : View
    {
        private readonly ModelNode _modelNode;
        private readonly CodeEditorController _codeEditorController;

        public ViewDesigner(ModelNode modelNode)
        {
            _modelNode = modelNode;
            _codeEditorController = new CodeEditorController("fileName.cs", "");

            Child = BuildEditor(_codeEditorController);
        }

        private static Widget BuildEditor(CodeEditorController codeEditorController)
        {
            return new Column()
            {
                Children = new Widget[]
                {
                    BuildActionBar(),
                    new Expanded() { Child = new CodeEditorWidget(codeEditorController) },
                }
            };
        }

        private static Widget BuildActionBar()
        {
            return new Container()
            {
                Color = new Color(0xFF3C3C3C), Height = 40,
                Padding = EdgeInsets.Only(15, 8, 15, 8),
                Child = new Row(VerticalAlignment.Middle, 10)
                {
                    Children = new Widget[]
                    {
                        new Button("Preview") { Width = 75 },
                        new Button("Debug") { Width = 75 }
                    }
                }
            };
        }
    }
}