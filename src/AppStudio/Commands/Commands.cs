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
        NewWorkflowCommand = new NewCommand(designContext, "Workflow");
        NewEnumCommand = new NewCommand(designContext, "Enum");
        CheckoutCommand = new CheckoutCommand(designContext);
        SaveCommand = new SaveCommand(designContext);
        RenameCommand = new RenameCommand(designContext);
        DeleteCommand = new DeleteCommand(designContext);
        PublishCommand = new PublishCommand(designContext);
        BuildAppCommand = new BuildAppCommand(designContext);
        ExportCommand = new ExportCommand(designContext);
        ImportCommand = new ImportCommand(designContext);
        UsagesCommand = new FindUsagesCommand(designContext);
        DependencyCommand = new DependencyCommand(designContext);
        NotImplCommand = () => Notification.Error("暂未实现");
    }

    public readonly NewAppCommand NewAppCommand;
    public readonly NewCommand NewFolderCommand;
    public readonly NewCommand NewEntityCommand;
    public readonly NewCommand NewServiceCommand;
    public readonly NewCommand NewViewCommand;
    public readonly NewCommand NewPermissionCommand;
    public readonly NewCommand NewReportCommand;
    public readonly NewCommand NewWorkflowCommand;
    public readonly NewCommand NewEnumCommand;
    public readonly CheckoutCommand CheckoutCommand;
    public readonly SaveCommand SaveCommand;
    public readonly RenameCommand RenameCommand;
    public readonly DeleteCommand DeleteCommand;
    public readonly PublishCommand PublishCommand;
    public readonly BuildAppCommand BuildAppCommand;
    public readonly ExportCommand ExportCommand;
    public readonly ImportCommand ImportCommand;
    public readonly FindUsagesCommand UsagesCommand;
    public readonly DependencyCommand DependencyCommand;
    public readonly Action NotImplCommand;
}