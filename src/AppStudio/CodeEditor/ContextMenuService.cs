using CodeEditor;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 用于构建代码编辑器的右键菜单
/// </summary>
internal static class ContextMenuService
{
    internal static MenuItem[] BuildContextMenu(DesignStore designStore, TextEditor textEditor)
    {
        return new MenuItem[]
        {
            MenuItem.Item("Goto Definition", null, () => new GotoDefinitionCommand(designStore).Execute(textEditor)),
            MenuItem.Divider(),
            MenuItem.Item("Format Document", null, () => FormatDocumentCommand.Default.Execute(textEditor)),
        };
    }
}