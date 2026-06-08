using System.Diagnostics;
using AppBoxCore;

namespace AppBox.Workflow;

public sealed class WorkflowInstance : ExpressionContext
{
    internal WorkflowInstance() { }

    public WorkflowInstance(string title, StartActivity startActivity,
        Guid creatorId, string creatorName,
        Dictionary<string, AnyValue> parameters)
    {
        Id = SequenceGuid.New();
        Title = title;
        Parameters = parameters;
        CreateTime = DateTime.Now;
        CreatorId = creatorId;
        CreatorName = creatorName;
        Status = WorkflowStatus.Running;
        StartActivity = startActivity;
    }

    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public StartActivity StartActivity { get; private set; }
    public Guid CreatorId { get; private set; }
    public string CreatorName { get; private set; }
    public DateTime CreateTime { get; private set; }
    public Dictionary<string, AnyValue> Parameters { get; } = [];
    public WorkflowStatus Status { get; private set; }

    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);
    private readonly List<RunningActivity> _running = [];
    private IWorkflowStore _store = null!;

    internal async Task Start(IWorkflowStore workflowStore)
    {
        _store = workflowStore;
        _running.Add(new RunningActivity() { Activity = StartActivity.Next });
        await _store.InsertWorkflowInstance(this);
        Continue(StartActivity.Next);
    }

    public void Restart(IWorkflowStore workflowStore)
    {
        _store = workflowStore;
    }

    private void Continue(Activity activity)
    {
        Task.Run(async () =>
        {
            var result = activity.Execute(this);
            await _lock.WaitAsync();
            try
            {
                var branchIndex = -1;
                for (var i = 0; i < _running.Count; i++)
                {
                    if (_running[i].Activity == activity)
                    {
                        branchIndex = i;
                        break;
                    }
                }

                Debug.Assert(branchIndex >= 0);

                switch (result)
                {
                    case null:
                    {
                        throw new NotImplementedException();
                        break;
                    }
                    case ErrorResult error:
                    {
                        throw new NotImplementedException();
                        break;
                    }
                    case Activity next:
                    {
                        _running[branchIndex] = new RunningActivity() { Activity = next };
                        await _store.UpdateWorkflowInstance(this, null);
                        break;
                    }
                    case Bookmark bookmark:
                    {
                        _running[branchIndex] = new RunningActivity() { Activity = activity, Bookmark = bookmark };
                        await _store.UpdateWorkflowInstance(this, bookmark);
                        break;
                    }
                    default: throw new NotImplementedException();
                }
            }
            finally
            {
                _lock.Release();
            }
        });
    }

    internal void Resume(Guid bookmarkId, Guid ouid, IHumanActionResult result) { }

    internal readonly struct RunningActivity
    {
        public required Activity Activity { get; init; }
        public Bookmark? Bookmark { get; init; }
    }
}