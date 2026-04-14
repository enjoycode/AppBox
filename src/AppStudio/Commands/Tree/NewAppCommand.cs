using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewAppCommand : DesignCommand
{
    public NewAppCommand(DesignHub context) : base(context) { }

    public void Execute() => new NewAppDialog(Context).Show();

    private sealed class NewAppDialog : Dialog
    {
        public NewAppDialog(DesignHub context)
        {
            Width = 300;
            Height = 210;
            Title.Value = "New Application";

            _designContext = context;
        }

        private readonly DesignHub _designContext;
        private DesignStore DesignStore => (DesignStore)_designContext.DesignUIService;
        private readonly State<string> _owner = "";
        private readonly State<string> _name = "";

        protected override Widget BuildBody() => new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Column()
            {
                Children =
                {
                    new Form()
                    {
                        LabelWidth = 80,
                        Children =
                        [
                            new FormItem("Owner:", new TextInput(_owner) { HintText = "eg: CompanyName" }),
                            new FormItem("Name:", new TextInput(_name) { HintText = "eg: erp" })
                        ]
                    }
                }
            }
        };

        protected override ValueTask<bool> OnClosing(string result)
        {
            if (result == DialogResult.OK)
                CreateAsync();
            return base.OnClosing(result);
        }

        private async void CreateAsync()
        {
            try
            {
                var ownerName = _owner.Value;
                var appName = _name.Value;
                if (string.IsNullOrEmpty(appName) || string.IsNullOrEmpty(ownerName))
                    throw new Exception("Invalid Owner or Name.");

                var node = _designContext.DesignTree.FindApplicationNodeByName(appName.AsMemory());
                if (node != null)
                    throw new Exception("Application has existed.");

                var appModel = new ApplicationModel(ownerName, appName);
                var appRootNode = _designContext.DesignTree.AppRootNode;
                foreach (var existsAppNode in appRootNode.Children)
                {
                    if (existsAppNode.Model.Id == appModel.Id)
                        throw new Exception("Application's Id already exists.");
                }

                //先保存
                await _designContext.MetaStoreService.CreateApplicationAsync(appModel);

                var appNode = new ApplicationNode(_designContext.DesignTree, appModel);
                var insertIndex = appRootNode.Children.Add(appNode);
                var result = new NewNodeResult(DesignNodeType.ApplicationRoot, appRootNode.Id, appNode,
                    null, insertIndex);
                result.ResolveToTree(DesignStore);
                DesignStore.OnNewNode(result);
            }
            catch (Exception e)
            {
                Notification.Error($"New App error: {e.Message}");
            }
        }
    }
}