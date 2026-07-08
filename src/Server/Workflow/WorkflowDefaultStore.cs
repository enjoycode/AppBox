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
    public Task InsertWorkflowInstance(WorkflowInstance instance)
    {
        var obj = new WFInstance(instance.Id);
        obj.Title = instance.Title;
        obj.CreatorId = instance.CreatorId;
        obj.CreateTime = instance.CreateTime;
        obj.Status = (byte)instance.Status;
        obj.Context = instance.GetContextData();

        return SqlStore.Default.InsertAsync(obj);
    }

    public async Task UpdateWorkflowInstance(WorkflowInstance instance, Bookmark? bookmark)
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

    public async Task UpdateWorkflowInstance(WorkflowInstance instance, Guid bookmarkId, Guid actorId,
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
        updateCmd.Where(cmd => cmd.T.F(nameof(WFInstance.Id)) == instance.Id);
        return updateCmd;
    }
}