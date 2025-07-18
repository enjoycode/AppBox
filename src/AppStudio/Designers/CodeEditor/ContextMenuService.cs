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
        return new[]
        {
            MenuItem.Item("Goto Definition", null, () => GotoDefinitionCommand.Execute(designStore, textEditor)),
            MenuItem.Divider(),
            MenuItem.Item("Format Document", null, () => FormatDocumentCommand.Execute(textEditor)),
        };
    }
}