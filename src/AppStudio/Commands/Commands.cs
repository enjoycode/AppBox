using PixUI;

namespace AppBoxDesign;

internal abstract class DesignCommand
{
    protected DesignCommand(DesignHub context)
    {
        Context = context;
    }

    protected readonly DesignHub Context;
    protected DesignStore DesignStore => (DesignStore)Context.DesignUIService;
}

internal sealed class Commands
{
    public Commands(DesignHub designContext)
    {
        NewAppCommand = new NewAppCommand(designContext);
        NewEntityCommand = new NewCommand(designContext, "Entity");
        NewViewCommand = new NewCommand(designContext, "View");
        NewFolderCommand = new NewCommand(designContext, "Folder");
        NewServiceCommand = new NewCommand(designContext, "Service");
        NewPermissionCommand = new NewCommand(designContext, "Permission");
        NewReportCommand = new NewCommand(designContext, "Report");
        NewEnumCommand = new NewCommand(designContext, "Enum");
        CheckoutCommand = new CheckoutCommand(designContext);
        SaveCommand = new SaveCommand(designContext);
        RenameCommand = new RenameCommand(designContext);
        DeleteCommand = new DeleteCommand(designContext);
        PublishCommand = new PublishCommand(designContext);
        BuildAppCommand = new BuildAppCommand(designContext);
        UsagesCommand = new FindUsagesCommand(designContext);
        NotImplCommand = () => Notification.Error("暂未实现");
    }

    public readonly NewAppCommand NewAppCommand;
    public readonly NewCommand NewFolderCommand;
    public readonly NewCommand NewEntityCommand;
    public readonly NewCommand NewServiceCommand;
    public readonly NewCommand NewViewCommand;
    public readonly NewCommand NewPermissionCommand;
    public readonly NewCommand NewReportCommand;
    public readonly NewCommand NewEnumCommand;
    public readonly CheckoutCommand CheckoutCommand;
    public readonly SaveCommand SaveCommand;
    public readonly RenameCommand RenameCommand;
    public readonly DeleteCommand DeleteCommand;
    public readonly PublishCommand PublishCommand;
    public readonly BuildAppCommand BuildAppCommand;
    public readonly FindUsagesCommand UsagesCommand;
    public readonly Action NotImplCommand;
}