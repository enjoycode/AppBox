using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewAppCommand : DesignCommand
{
    public NewAppCommand(DesignContext context) : base(context) { }

    public async void Execute()
    {
        var dlg = new NewAppDialog();
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK)
            return;

        try
        {
            if (string.IsNullOrEmpty(dlg.Owner) || string.IsNullOrEmpty(dlg.Name))
                throw new Exception("Invalid Owner or Name.");

            var app = new ApplicationModel(dlg.Owner, dlg.Name);
            var node = Context.DesignTree.FindApplicationNodeByName(app.Name.AsMemory());
            if (node != null)
                throw new Exception("Application has existed.");

            await CreateApplication(Context, app);
        }
        catch (Exception e)
        {
            Notification.Error($"New App error: {e.Message}");
        }
    }

    internal static async Task<ApplicationNode> CreateApplication(DesignContext context, ApplicationModel app)
    {
        var designStore = (DesignStore)context.DesignUIService;
        var appRootNode = context.DesignTree.AppRootNode;
        foreach (var existsAppNode in appRootNode.Children)
        {
            if (existsAppNode.Model.Id == app.Id)
                throw new Exception("Application's Id already exists.");
        }

        //先保存
        await context.MetaStoreService.CreateApplicationAsync(app);

        var appNode = new ApplicationNode(context.DesignTree, app);
        var insertIndex = appRootNode.Children.Add(appNode);
        var result = new NewNodeResult(DesignNodeType.ApplicationRoot, appRootNode.Id, appNode,
            null, insertIndex);
        result.ResolveToTree(designStore);
        designStore.OnNewNode(result);

        return appNode;
    }

    private sealed class NewAppDialog : Dialog
    {
        public NewAppDialog()
        {
            Width = 300;
            Height = 210;
            Title.Value = "New Application";
        }

        private readonly State<string> _owner = "";
        private readonly State<string> _name = "";

        public string Owner => _owner.Value;
        public string Name => _name.Value;

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
    }
}