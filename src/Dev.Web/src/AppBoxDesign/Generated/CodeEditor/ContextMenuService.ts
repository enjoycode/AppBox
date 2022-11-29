import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

/// <summary>
/// 用于构建代码编辑器的右键菜单
/// </summary>
export class ContextMenuService {
    public static BuildContextMenu(textEditor: CodeEditor.TextEditor): PixUI.MenuItem[] {
        return [
            PixUI.MenuItem.Item("Goto Definition", null, () => AppBoxDesign.GotoDefinitionCommand.Default.Execute(textEditor)),
            PixUI.MenuItem.Divider(),
            PixUI.MenuItem.Item("Format Document", null, () => AppBoxDesign.FormatDocumentCommand.Default.Execute(textEditor)),
        ];
    }
}