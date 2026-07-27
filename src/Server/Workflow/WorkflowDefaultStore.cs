using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

/// <summary>
/// 工作流默认的Sql存储
/// </summary>
public sealed class WorkflowDefaultStore : IWorkflowStore
{
    public async Task<WorkflowInstance> FetchInstance(Guid instanceId)
    {
        var wfInstance = new WFInstance(instanceId);
        await SqlStore.Default.FetchAsync(wfInstance);

        var instance = new WorkflowInstance();
        instance.Id = wfInstance.Id;
        instance.Title = wfInstance.Title;
        instance.ModelVersion = wfInstance.ModelVersion;
        instance.CreatorId = wfInstance.CreatorId;
        instance.CreateTime = wfInstance.CreateTime;
        instance.Status = (WorkflowStatus)wfInstance.Status;
        instance.Parameters = WorkflowParameters.Deserialize(wfInstance.Parameters);

        using var ms = new MemoryStream(wfInstance.Context);
        var rs = new SystemReadStream(ms);
        instance.DeserializeContext(ref rs);
        return instance;
    }

    public Task InsertInstance(WorkflowInstance instance)
    {
        var obj = new WFInstance(instance.Id);
        obj.Title = instance.Title;
        obj.CreatorId = instance.CreatorId;
        obj.CreateTime = instance.CreateTime;
        obj.Status = (byte)instance.Status;
        obj.Context = instance.GetContextData();
        obj.Parameters = WorkflowParameters.Serialize(instance.Parameters);

        return SqlStore.Default.InsertAsync(obj);
    }

    private static byte[]? GetBookmarkActionsData(Bookmark? bookmark)
    {
        if (bookmark == null || bookmark.Actions.Length == 0)
            return null;
        return HumanAction.WriteActions(bookmark.Actions);
    }

    public async Task UpdateInstance(WorkflowInstance instance, Bookmark? bookmark)
    {
        await using var txn = await SqlStore.Default.BeginTransactionAsync();

        try
        {
            var updateCmd = CreateUpdateCommand(instance);
            await updateCmd.ExecAsync(txn);

            if (bookmark != null)
            {
                foreach (var actorId in bookmark.Actors)
                {
                    var task = new WFTask(actorId, instance.Id, bookmark.Id);
                    task.Title = bookmark.Title;
                    task.CreateTime = DateTime.Now;
                    task.FormName = bookmark.FormName;
                    task.Actions = GetBookmarkActionsData(bookmark);
                    await SqlStore.Default.InsertAsync(task, txn);
                }
            }

            await txn.CommitAsync();
        }
        catch (Exception e)
        {
            await txn.RollbackAsync();
            Logger.Error(e.Message);
            throw;
        }
    }

    public async Task UpdateInstance(WorkflowInstance instance, Guid bookmarkId, Guid actorId,
        ResumeResult resumeResult)
    {
        await using var txn = await SqlStore.Default.BeginTransactionAsync();
        try
        {
            var updateCmd = CreateUpdateCommand(instance);
            await updateCmd.ExecAsync(txn);

            var deleteTaskCmd = new SqlDeleteCommand(WFTask.MODELID);
            if (resumeResult.CancelOthers)
            {
                deleteTaskCmd.Where(cmd =>
                    cmd.T.F(nameof(WFTask.InstanceId)) == instance.Id &
                    cmd.T.F(nameof(WFTask.BookmarkId)) == bookmarkId);
            }
            else
            {
                deleteTaskCmd.Where(cmd =>
                    cmd.T.F(nameof(WFTask.ActorId)) == actorId &
                    cmd.T.F(nameof(WFTask.InstanceId)) == instance.Id &
                    cmd.T.F(nameof(WFTask.BookmarkId)) == bookmarkId);
            }

            await deleteTaskCmd.ExecAsync(txn);

            await txn.CommitAsync();
        }
        catch (Exception e)
        {
            await txn.RollbackAsync();
            Logger.Error(e.Message);
            throw;
        }
    }

    private static SqlUpdateCommand CreateUpdateCommand(WorkflowInstance instance)
    {
        var updateCmd = new SqlUpdateCommand(WFInstance.MODELID);
        updateCmd.Update(cmd => Expression.Assign(cmd.T.F(nameof(WFInstance.Status)), (byte)instance.Status));
        updateCmd.Update(cmd => Expression.Assign(cmd.T.F(nameof(WFInstance.Context)), instance.GetContextData()));
        updateCmd.Update(cmd => Expression.Assign(cmd.T.F(nameof(WFInstance.Parameters)),
            Expression.Constant(WorkflowParameters.Serialize(instance.Parameters))));
        updateCmd.Where(cmd => cmd.T.F(nameof(WFInstance.Id)) == instance.Id);
        return updateCmd;
    }
}