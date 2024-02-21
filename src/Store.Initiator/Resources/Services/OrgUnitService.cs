using sys.Entities;

public sealed class OrgUnitService
{
    // 加载组织结构树
    public Task<IList<OrgUnit>> LoadTree()
    {
        var q = new SqlQuery<OrgUnit>();
        return q.ToTreeAsync(t => t.Children);
    }

    public Task<Enterprise?> FetchEnterprise(Guid id) => Enterprise.FetchAsync(id);
    public Task<Workgroup?> FetchWorkgroup(Guid id) => Workgroup.FetchAsync(id);
    public Task<Employee?> FetchEmployee(Guid id) => Employee.FetchAsync(id);

    private async Task CheckParent(Guid parentId)
    {
        if (parentId == Guid.Empty) throw new Exception("必须指定上级");
        var parent = await OrgUnit.FetchAsync(parentId);
        if (parent == null) throw new Exception("无法获取上级");
        if (parent.BaseType == Employee.MODELID) throw new Exception("无法新建员工节点的下级");
    }

    // 新建工作组
    [InvokePermission(sys.Permissions.Admin)]
    public async Task<OrgUnit> NewWorkgroup(Guid parentId)
    {
        await CheckParent(parentId);

        // 新建实例
        var workgroup = new Workgroup { Id = Guid.NewGuid(), Name = "新工作组" };
        var ou = new OrgUnit { Id = workgroup.Id, Name = workgroup.Name, Base = workgroup, ParentId = parentId };

        //保存并返回
        var db = ou.GetSqlStore();
        await using var txn = await db.BeginTransactionAsync();
        await workgroup.InsertAsync(txn);
        await ou.InsertAsync(txn);
        await txn.CommitAsync();

        return ou;
    }

    // 新建员工
    [InvokePermission(sys.Permissions.Admin)]
    public async Task<OrgUnit> NewEmployee(Guid parentId)
    {
        await CheckParent(parentId);

        // 新建实例
        var emp = new Employee { Id = Guid.NewGuid(), Name = "新员工" };
        var ou = new OrgUnit { Id = emp.Id, Name = emp.Name, Base = emp, ParentId = parentId };

        // 保存并返回
        var db = ou.GetSqlStore();
        await using var txn = await db.BeginTransactionAsync();
        await emp.InsertAsync(txn);
        await ou.InsertAsync(txn);
        await txn.CommitAsync();

        return ou;
    }

    [InvokePermission(sys.Permissions.Admin)]
    public async Task SaveWorkgroup(Workgroup workgroup, Guid ouId, string ouName)
    {
        var db = workgroup.GetSqlStore();
        await using var txn = await db.BeginTransactionAsync();
        await workgroup.UpdateAsync(txn);
        if (ouName != workgroup.Name)
        {
            var cmd = new SqlUpdateCommand<OrgUnit>()
                .Where(t => t.Id == ouId)
                .Update(t => t.Name = workgroup.Name);
            await cmd.ExecAsync(txn);
        }
        await txn.CommitAsync();
    }

    [InvokePermission(sys.Permissions.Admin)]
    public async Task SaveEmployee(Employee employee, Guid ouId, string ouName)
    {
        var db = employee.GetSqlStore();
        await using var txn = await db.BeginTransactionAsync();
        await employee.UpdateAsync(txn);
        if (ouName != employee.Name)
        {
            var cmd = new SqlUpdateCommand<OrgUnit>()
                   .Where(t => t.Id == ouId)
                   .Update(t => t.Name = employee.Name);
            await cmd.ExecAsync(txn);
        }
        
        await txn.CommitAsync();
    }
    
    [InvokePermission(sys.Permissions.Admin)]
    public Task NewEmployeeUser(Employee employee, string account, string password)
    {
        if (string.IsNullOrEmpty(account) || string.IsNullOrEmpty(password))
            throw new ArgumentException("用户或密码不能为空");
            
        employee.Account = account;
        employee.Password = RuntimeContext.PasswordHasher!.HashPassword(password);
        return employee.UpdateAsync();
    }
    
    [InvokePermission(sys.Permissions.Admin)]
    public Task DeleteEmployeeUser(Employee employee)
    {
        employee.Account = null;
        employee.Password = null;
        return employee.UpdateAsync();
    }
    
    [InvokePermission(sys.Permissions.Admin)]
    public Task ResetPassword(Employee employee, string password)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentException("密码不能为空");
        
        employee.Password = RuntimeContext.PasswordHasher!.HashPassword(password);
        return employee.UpdateAsync();
    }
}