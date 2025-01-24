using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class PublishDialog : Dialog
{
    public PublishDialog()
    {
        Width = 400;
        Height = 300;
        Title.Value = "Publish";
    }

    private readonly DataGridController<PendingChange> _dataGridController = new();

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new DataGrid<PendingChange>(_dataGridController)
            {
                Columns =
                {
                    new DataGridTextColumn<PendingChange>("Type", GetChangeType),
                    new DataGridTextColumn<PendingChange>("Name", GetChangeName),
                }
            }
        };
    }

    protected override void OnMounted()
    {
        base.OnMounted();
        //开始加载变更项
        LoadChanges();
    }

    private async void LoadChanges()
    {
        //TODO: 保存所有尚未保存的内容，否则可能服务端保存的与本地不一致

        try
        {
            var res = await DesignHub.Current.StagedService.LoadChangesAsync();
            var designTree = DesignHub.Current.DesignTree;
            foreach (var change in res)
            {
                switch (change.Type)
                {
                    case StagedType.Model:
                        change.DesignNode = designTree.FindNode(DesignNodeType.ModelNode, change.Id);
                        break;
                    case StagedType.Folder:
                        change.DesignNode = designTree.FindNode(DesignNodeType.ModelRootNode, change.Id);
                        break;
                    default:
                        throw new NotImplementedException(change.Type.ToString());
                }
            }

            _dataGridController.DataSource = new List<PendingChange>(res);
        }
        catch (Exception ex)
        {
            Notification.Error($"加载模型变更失败:{ex.Message}");
        }
    }

    private static string GetChangeType(PendingChange change)
    {
        if (change.DesignNode == null) return string.Empty;
        switch (change.Type)
        {
            case StagedType.Model:
                var modelNode = (ModelNode)change.DesignNode;
                return modelNode.ModelType.ToString();
            case StagedType.Folder:
                return "Folder";
            default:
                throw new NotImplementedException();
        }
    }

    private static string GetChangeName(PendingChange change)
    {
        if (change.DesignNode == null) return string.Empty;

        switch (change.Type)
        {
            case StagedType.Model:
                var modelNode = (ModelNode)change.DesignNode;
                return $"{modelNode.AppNode.Label.Value}.{modelNode.Label.Value}";
            case StagedType.Folder:
                var modelRootNode = (ModelRootNode)change.DesignNode;
                var appNode = (ApplicationNode)modelRootNode.Parent!;
                return $"{appNode.Label.Value}.{modelRootNode.Label.Value}";
            default:
                throw new NotImplementedException();
        }
    }

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result == DialogResult.OK) //TODO: check no items to publish
            PublishAsync();
        return base.OnClosing(result);
    }

    private static async void PublishAsync()
    {
        try
        {
            await Channel.Invoke("sys.DesignService.Publish", new object?[] { "commit message" });
            Notification.Success("发布成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"发布失败: {ex.Message}");
        }
    }
}