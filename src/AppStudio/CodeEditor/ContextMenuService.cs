using CodeEditor;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 用于构建代码编辑器的右键菜单
/// </summary>
internal static class ContextMenuService
{
    internal static MenuItem[] BuildContextMenu(TextEditor textEditor)
    {
        return new MenuItem[]
        {
            MenuItem.Item("Goto Definition", null, () => GotoDefinitionCommand.Default.Execute(textEditor)),
        };
    }
}