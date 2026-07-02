using AppBoxDesign.CodeEditor;
using PixUI.CodeEditor;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 用于构建代码编辑器的右键菜单
/// </summary>
internal static class ContextMenuService
{
    internal static MenuItem[] BuildContextMenu(DesignContext designContext, TextEditor textEditor)
    {
        return
        [
            MenuItem.Item("Rename", null, () => RenameSymbolCommand.Execute(designContext, textEditor)),
            MenuItem.Item("Goto Definition", null, () => GotoDefinitionCommand.Execute(designContext, textEditor)),
            MenuItem.Divider(),
            MenuItem.Item("Format Document", null, () => FormatDocumentCommand.Execute(designContext, textEditor))
        ];
    }
}