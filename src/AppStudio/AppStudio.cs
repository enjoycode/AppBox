using System.Runtime.InteropServices;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

public sealed class AppStudio : View
{
    public AppStudio()
    {
        //Create DesignContext as Init services
        _designContext = new DesignHub(Channel.SessionName, Channel.LeafOrgUnitId);
        _designContext.InitServices(new DesignStore(_designContext), new CheckoutService(),
            new StagedService(), new MetaStoreService(), new PublishService());

        Child = new Column
        {
            Children =
            {
                new MainMenuPad(_designContext),
                new Expanded
                {
                    Child = new Row
                    {
                        Children =
                        {
                            new NaviBar(_designContext),
                            new Expanded()
                            {
                                Child = new Splitter
                                {
                                    Fixed = Splitter.FixedPanel.Panel1,
                                    Distance = 250,
                                    Panel1 = new SidePad(_designContext),
                                    Panel2 = new Splitter
                                    {
                                        Orientation = Axis.Vertical,
                                        Fixed = Splitter.FixedPanel.Panel2,
                                        Distance = 190,
                                        Panel1 = new DesignerPad(_designContext),
                                        Panel2 = new BottomPad(_designContext)
                                    }
                                }
                            }
                        }
                    }
                },
                new FooterPad()
            }
        };
    }

    private readonly DesignHub _designContext;

    protected override async void OnMounted()
    {
        try
        {
            base.OnMounted();

            //Init platform support
            LocalFileSystem.Init(new OSFileSystem()); //TODO: by platform
            IMetadataReferenceProvider metadataReferenceProvider =
                RuntimeInformation.ProcessArchitecture == Architecture.Wasm
                    ? new ServerMetadataReferenceProvider()
                    : new ClientMetadataReferenceProvider();
            await MetadataReferences.InitAsync(metadataReferenceProvider);
            //开始加载DesignTree
            await _designContext.DesignUIService.LoadDesignTreeAsync();
        }
        catch (Exception e)
        {
            Notification.Error($"Can't initialize AppStudio:  {e.Message}");
        }
    }
}