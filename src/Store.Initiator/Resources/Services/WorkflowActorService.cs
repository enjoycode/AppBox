using sys.Entities;

/// <summary>
/// 用于工作流获取参与者
/// </summary>
public sealed class WorkflowActorService
{
    //以下标为WorkflowActor的方法:
    //1. 参数为Guid, 返回类型为Guid[]，均指向OrgUnit
    //2. 更命或删除请确认同步工作流模型使用到的
    //3. 可以抛出异常，工作流运行时记录日志

    [WorkflowActor("上级")]
    public async Task<Guid[]> GetManager(Guid ouid)
    {
        //TODO: 暂简单实现
        Guid? tempId = ouid;
        while (tempId.HasValue)
        {
            var orgUnit = await OrgUnit.FetchAsync(tempId.Value);
            if (orgUnit == null) throw new Exception($"Can't find OrgUnit: [{tempId.Value}]'");

            if (orgUnit.BaseType == Workgroup.MODELID)
            {
                var workgroup = await Workgroup.FetchAsync(orgUnit.Id);
                if (workgroup != null && workgroup.ManagerId.HasValue)
                    return [workgroup.ManagerId.Value];
            }
            else if (orgUnit.BaseType == Enterprise.MODELID)
            {
                var enterprise = await Enterprise.FetchAsync(orgUnit.Id);
                if (enterprise != null && enterprise.ManagerId.HasValue)
                    return [enterprise.ManagerId.Value];
            }
            else
                tempId = orgUnit.ParentId;
        }

        return [];
    }

    [WorkflowActor("总监")]
    public Task<Guid[]> GetDirector(Guid ouid)
    {
        throw new NotImplementedException();
    }

}