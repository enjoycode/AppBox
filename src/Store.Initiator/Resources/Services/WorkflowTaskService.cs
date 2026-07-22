using sys.Entities;

//用于运行时获取工作流任务
public sealed class WorkflowTaskService
{
    // 获取当前用户的待办事项
    public async Task<WorkflowTaskInfo[]> GetMyTasks()
    {
        if (RuntimeContext.CurrentSession == null) throw new Exception("Session not exists.");

        var userId = RuntimeContext.CurrentSession.LeafOrgUnitId;
        var q = new SqlQuery<WFTask>();
        q.Where(t => t.ActorId == userId);
        var result = await q.ToListAsync(t => new WorkflowTaskInfo()
        {
            InstanceId = t.InstanceId,
            BookmarkId = t.BookmarkId,
            ActorId = t.ActorId,
            ModelVersion = t.Instance!.ModelVersion,
            InstanceTitle = t.Instance.Title,
            TaskTitle = t.Title,
            ActorName = t.Actor!.Name,
            CreatorName = t.Instance.Creator!.Name
        });
        return result.ToArray();
    }
}