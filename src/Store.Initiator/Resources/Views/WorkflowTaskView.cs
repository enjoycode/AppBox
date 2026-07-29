namespace sys.Views;

public sealed class WorkflowTaskView : View
{
    public static Widget Preview() => new WorkflowTaskView(new()
    {
        InstanceTitle = "Mock Instance",
        TaskTitle = "Mock Task",
        Actions = [new HumanAction("同意"), new HumanAction("拒绝")]
    });

    public WorkflowTaskView(WorkflowTaskInfo taskInfo)
    {
        _taskInfo = taskInfo;

        Child = new Column()
        {
            Children =
            [
                  BuildCmdBar(taskInfo),
                  BuildForm(taskInfo),
            ]
        };
    }

    private readonly WorkflowTaskInfo _taskInfo;
    private readonly State<string> _memo = string.Empty;
    private readonly State<bool> _hasSubmit = false;
    private IWorkflowForm? _form;
    public bool HasSubmit => _hasSubmit.Value;
    public Size ViewSize => _form == null ? new(300, 200) : _form.ViewSize;

    private Widget BuildCmdBar(WorkflowTaskInfo taskInfo)
    {
        var children = new List<Widget>();
        //children.Add(new Text(taskInfo.InstanceTitle));
        children.Add(new Text("备注:"));
        children.Add(new Expanded(new TextInput(_memo) { Readonly = _hasSubmit }));
        foreach (var action in taskInfo.Actions)
        {
            children.Add(new Button(action.Name) { OnTap = _ => SubmitAction(action), Enabled = _hasSubmit.ToReversed() });
        }

        return new Card()
        {
            Padding = EdgeInsets.All(5),
            Child = new Row() { Spacing = 5, Children = children.ToArray() }
        };
    }

    private Widget BuildForm(WorkflowTaskInfo taskInfo)
    {
        if (string.IsNullOrEmpty(taskInfo.FormName))
            return BuildCommonForm(taskInfo);
        throw new NotImplementedException();
    }

    private Widget BuildCommonForm(WorkflowTaskInfo taskInfo)
    {
        //var rows = 3;
        var form = new Form() { LabelWidth = 80 };
        form.Children.Add(new("工作流:", new TextInput(taskInfo.InstanceTitle) { Readonly = true }));
        form.Children.Add(new("任务:", new TextInput(taskInfo.TaskTitle) { Readonly = true }));
        form.Children.Add(new("创建者:", new TextInput(taskInfo.CreatorName) { Readonly = true }));
        //TODO: add paramters
        return new Card() { Child = new Container() { Child = form } };
    }

    private async void SubmitAction(HumanAction action)
    {
        if (_form != null)
        {
            try { await _form.BeforeSubmit(action); }
            catch (Exception ex) { Notification.Error($"BeforeSubmit error: {ex.Message}"); }
        }

        try
        {
            await sys.Services.WorkflowService.Resume(_taskInfo.InstanceId, _taskInfo.BookmarkId,
                action.Name, _memo.Value);
            _hasSubmit.Value = true;
        }
        catch (Exception ex) { Notification.Error($"Submit error: {ex.Message}"); }
    }
}