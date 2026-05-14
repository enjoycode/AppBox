using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewCommand : DesignCommand
{
    public NewCommand(DesignHub context, string type) : base(context)
    {
        if (type != "Folder" && type != "Service" && type != "Permission" &&
            type != "Report" && type != "Enum" && type != "Workflow" && type != "Entity" && type != "View")
            throw new ArgumentException("Invalid type");
        _type = type;
    }

    private readonly string _type;

    public void Execute()
    {
        if (_type == "Entity")
            new NewEntityDialog(Context).Show();
        else if (_type == "View")
            new NewViewDialog(Context).Show();
        else
            new NewDialog(Context, _type).Show();
    }

    /// <summary>
    /// 通用的新建对话框
    /// </summary>
    private sealed class NewDialog : Dialog
    {
        public NewDialog(DesignHub designContext, string type)
        {
            _designContext = designContext;
            Width = 300;
            Height = 180;
            Title.Value = $"New {type}";
            _type = type;
        }

        private readonly DesignHub _designContext;
        private DesignStore DesignStore => (DesignStore)_designContext.DesignUIService;
        private readonly State<string> _name = "";
        private readonly string _type;

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new TextInput(_name) { HintText = "Please input name" }
            };
        }

        protected override ValueTask<bool> OnClosing(string result)
        {
            if (result == DialogResult.OK && !string.IsNullOrEmpty(_name.Value))
                CreateAsync();
            return base.OnClosing(result);
        }

        private async void CreateAsync()
        {
            try
            {
                var selectedNode = DesignStore.TreeController.FirstSelectedNode;
                if (selectedNode == null) return;

                var res = _type switch
                {
                    "Folder" => await NewFolder(selectedNode.Data, _name.Value),
                    "Service" => await NewService(selectedNode.Data, _name.Value),
                    "Permission" => await NewPermission(selectedNode.Data, _name.Value),
                    "Report" => await NewReport(selectedNode.Data, _name.Value),
                    "Workflow" => await NewWorkflow(selectedNode.Data, _name.Value),
                    "Enum" => await NewEnum(selectedNode.Data, _name.Value),
                    _ => throw new NotImplementedException(_type)
                };

                //根据返回结果同步添加新节点
                res.ResolveToTree(DesignStore);
                DesignStore.OnNewNode(res);
            }
            catch (Exception e)
            {
                Notification.Error($"Create error: {e.Message}");
            }
        }

        private async Task<NewNodeResult> NewFolder(DesignNode selectedNode, string name)
        {
            if (string.IsNullOrEmpty(name)) //TODO: other name validate
                throw new Exception("名称不能为空");

            //根据选择的节点获取合适的插入位置
            var parentNode = DesignTree.FindNewFolderParentNode(selectedNode, out var appId, out var modelType);
            if (parentNode == null)
                throw new Exception("无法找到上级节点");
            //判断是否已存在同名的
            DesignNodeList<DesignNode> children;
            if (parentNode is ModelRootNode modelRootNode)
                children = modelRootNode.Children;
            else if (parentNode is FolderNode folderNode)
                children = folderNode.Children;
            else
                throw new NotImplementedException();
            if (children.Exists(t => t.Type == DesignNodeType.FolderNode && t.Label.Value == name))
                throw new Exception("当前目录下已存在同名文件夹");

            //判断当前模型根节点有没有签出
            var rootNode = _designContext.DesignTree.FindModelRootNode(appId, modelType)!;
            var rootNodeHasCheckout = rootNode.IsCheckoutByMe;
            if (!await rootNode.CheckoutAsync())
                throw new Exception($"Can't checkout: {rootNode.Label}");
            ////注意:需要重新引用上级文件夹节点，因自动签出上级节点可能已重新加载
            //if (!rootNodeHasCheckout && parentNode.NodeType == DesignNodeType.FolderNode)
            //{
            //    parentNode = rootNode.FindFolderNode(((FolderNode)parentNode).Folder.ID);
            //    if (parentNode == null)
            //        throw new Exception("上级节点已不存在，请刷新重试");
            //}

            // 判断选择节点即parentNode是文件夹还是模型根节点
            ModelFolder model;
            if (parentNode.Type == DesignNodeType.FolderNode)
            {
                model = new ModelFolder(((FolderNode)parentNode).Folder, name);
            }
            else if (parentNode.Type == DesignNodeType.ModelRootNode)
            {
                //判断是否存在根文件夹
                rootNode.RootFolder ??= new ModelFolder(appId, rootNode.TargetType);
                model = new ModelFolder(rootNode.RootFolder, name);
            }
            else
                throw new Exception("不允许在此节点创建文件夹");

            var node = new FolderNode(model);
            //添加至设计树
            var insertIndex = children.Add(node);
            // 添加至根节点索引内
            rootNode.AddFolderIndex(node);
            // 保存到本地
            await node.SaveAsync();

            return new NewNodeResult(parentNode.Type, parentNode.Id,
                node, rootNodeHasCheckout ? null : rootNode.Id, insertIndex);
        }

        private Task<NewNodeResult> NewService(DesignNode selectedNode, string name)
        {
            return ModelCreator.Make(_designContext, ModelType.Service,
                id => new ServiceModel(id, name),
                selectedNode.Type, selectedNode.Id, name,
                _ => $$"""

                       public sealed class {{name}}
                       {
                           public string SayHello()
                           {
                               return "Hello World";
                           }
                       }
                       """);
        }

        private Task<NewNodeResult> NewPermission(DesignNode selectedNode, string name)
        {
            return ModelCreator.Make(_designContext, ModelType.Permission,
                id => new PermissionModel(id, name),
                selectedNode.Type, selectedNode.Id, name, _ => null);
        }

        private Task<NewNodeResult> NewReport(DesignNode selectedNode, string name)
        {
            return ModelCreator.Make(_designContext, ModelType.Report,
                id => new ReportModel(id, name),
                selectedNode.Type, selectedNode.Id, name,
                _ => $$"""
                       {
                         "PageSettings": {"PaperSize":["21cm","29.7cm"]},
                         "Items": [
                           {
                             "$T": "PageHeader",
                             "Height": "2cm",
                             "Items": [
                               {"$T": "TextBox", "Width": "3cm", "Height": "1cm", "Left": "5cm", "Top": "0.5cm", "Value": "Header"}
                             ]
                           },
                           {
                             "$T": "Details",
                             "Height": "5cm",
                             "Items": [
                               { 
                                 "$T": "TextBox", "Width": "3cm", "Height": "1cm", "Left": "5cm", "Top": "1cm", "Value": "Hello Future",
                                 "Style": { "Color": "FFFF0000", "VerticalAlign": "Middle", "BorderStyle": { "Default": "Solid" }, "Font": { "Size": "12pt" } }
                               }
                             ]
                           }
                         ]
                       }
                       """);
        }

        private Task<NewNodeResult> NewWorkflow(DesignNode selectedNode, string name)
        {
            return ModelCreator.Make(_designContext, ModelType.Workflow,
                id => new WorkflowModel(id, name),
                selectedNode.Type, selectedNode.Id, name, _ => null);
        }

        private Task<NewNodeResult> NewEnum(DesignNode selectedNode, string name)
        {
            return ModelCreator.Make(_designContext, ModelType.Enum,
                id => new EnumModel(id, name),
                selectedNode.Type, selectedNode.Id, name, _ => null);
        }
    }
}