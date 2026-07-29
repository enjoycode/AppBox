namespace sys.Views;

public sealed class WorkflowTaskList : View
{
    public WorkflowTaskList()
    {
        Child = new Container
        {
            Padding = EdgeInsets.All(20),
            Child = new DataGrid<WorkflowTaskInfo>(_controller)
                .AddRowNumColumn("", width: 30)
                .AddTextColumn("标题", r => r.InstanceTitle)
                .AddTextColumn("任务", r => r.TaskTitle)
                .AddTextColumn("操作者", r => r.ActorName, width: 60)
                .AddTextColumn("创建者", r => r.CreatorName, width: 60)
                .AddButtonColumn("操作", (r, i) => new Button("处理") { OnTap = _ => OnProcess(r) }, width: 60)
        };
    }

    private readonly DataGridController<WorkflowTaskInfo> _controller = new();

    protected override void OnMounted()
    {
        base.OnMounted();
        LoadData();
    }

    private async void LoadData()
    {
        try
        {
            _controller.DataSource = await sys.Services.WorkflowTaskService.GetMyTasks();
        }
        catch (Exception ex)
        {
            Notification.Error($"获取工作流任务失败: {ex.Message}");
        }
    }

    private async void OnProcess(WorkflowTaskInfo taskInfo)
    {
        //先获取工作流参数及当前任务的操作项
        if (taskInfo.Actions == null)
        {
            try
            {
                var data = await sys.Services.WorkflowService.FetchParameters(taskInfo.InstanceId);
                taskInfo.Parameters = WorkflowParameters.ReadFromData(data);
                data = await sys.Services.WorkflowService.FetchTaskActions(taskInfo.ActorId, taskInfo.InstanceId, taskInfo.BookmarkId);
                taskInfo.Actions = HumanAction.ReadActions(data);
            }
            catch(Exception ex)
            {
                Notification.Error($"Can't load parameters and actions.\n{ex.Message}'");
                return;
            }
        }
    
        var form = new WorkflowTaskView(taskInfo);
        await Dialog.ShowAsync(taskInfo.InstanceTitle, dlg => form, null, form.ViewSize);
        if (form.HasSubmit)
            LoadData();
    }
}