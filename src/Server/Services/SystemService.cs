using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;

namespace AppBoxServer;

/// <summary>
/// 系统内置的一些服务，如初始化存储、密码Hash等
/// </summary>
internal sealed class SystemService : IService
{
    private static readonly ModelId _adminPermissionId =
        ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 1, ModelLayer.SYS);

    private static void EnsureIsAdmin()
    {
        //TODO:
    }

    /// <summary>
    /// 用户登录时验证并返回组织单元的路径
    /// </summary>
    internal static async Task<TreePath> Login(string user, string password)
    {
        if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(password))
            throw new Exception("用户名或密码为空");

        //查找账号
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(e => e[nameof(Employee.Account)] == user);
        var emp = await q.ToSingleAsync();
        if (emp == null)
            throw new Exception("用户不存在");
        if (emp.Password == null)
            throw new Exception("用户密码不存在");

        //验证密码
        if (!RuntimeContext.PasswordHasher!.VerifyHashedPassword(emp.Password, password))
            throw new Exception("密码错误");

        //查找对应的组织单元
        var q1 = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        q1.Where(t => t[nameof(OrgUnit.Id)] == emp.Id);
        var ous = await q1.ToListAsync();
        if (ous.Count == 0)
            throw new Exception("用户不在组织内");
        var q2 = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        q2.Where(t => t[nameof(OrgUnit.Id)] == ous[0].Id); //暂始终取第一个组织单元
        var path = await q2.ToTreePathAsync(t => t[nameof(OrgUnit.Parent)], t => t[nameof(OrgUnit.Name)]);
        return path!;
    }

    /// <summary>
    /// 用于前端组织结构权限管理界面加载整个权限树
    /// </summary>
    private static async Task<IList<PermissionNode>> LoadPermissionTree()
    {
        var list = new List<PermissionNode>();
        var apps = await MetaStore.Provider.LoadAllApplicationAsync();
        //TODO:***暂简单实现加载全部，待优化且注意排序
        var allFolders = await MetaStore.Provider.LoadAllFolderAsync();
        var allModels = await MetaStore.Provider.LoadAllModelAsync();
        var folders = allFolders.Where(t => t.TargetModelType == ModelType.Permission);
        var permissions = allModels.Where(t => t.ModelType == ModelType.Permission);

        foreach (var app in apps)
        {
            var appNode = new PermissionNode
                { Name = app.Name, Children = new List<PermissionNode>() };
            list.Add(appNode);

            var folderIndex = new Dictionary<Guid, PermissionNode>();
            //加载文件夹
            var rootFolder = folders.SingleOrDefault(t => t.AppId == app.Id);
            if (rootFolder != null)
                LoopAddFolder(folderIndex, appNode, rootFolder);
            //加载PermissionModels
            var appPermisions = permissions.Where(t => t.AppId == app.Id).Cast<PermissionModel>();
            foreach (var permision in appPermisions)
            {
                var node = new PermissionNode
                {
                    Name = permision.Name,
                    ModelId = permision.Id.ToString(),
                    OrgUnits = permision.OrgUnits
                };
                if (permision.FolderId.HasValue &&
                    folderIndex.TryGetValue(permision.FolderId.Value, out var folderNode))
                {
                    folderNode.Children!.Add(node);
                }
                else
                {
                    appNode.Children.Add(node);
                }
            }
        }

        return list;
    }

    private static void LoopAddFolder(IDictionary<Guid, PermissionNode> dic, PermissionNode parent,
        ModelFolder folder)
    {
        var parentNode = parent;
        if (folder.Parent != null)
        {
            var node = new PermissionNode
                { Name = folder.Name!, Children = new List<PermissionNode>() };
            dic.Add(folder.Id, node);
            parent.Children!.Add(node);
            parentNode = node;
        }

        if (folder.HasChilds)
        {
            for (var i = 0; i < folder.Children.Count; i++)
            {
                LoopAddFolder(dic, parentNode, folder.Children[i]);
            }
        }
    }

    /// <summary>
    /// 保存单个PermissionModel的权限变更
    /// </summary>
    private static async Task<bool> SavePermission(string modelId, IList<Guid>? ouids)
    {
        EnsureIsAdmin();

        var oldModel = (PermissionModel)await MetaStore.Provider.LoadModelAsync(modelId);
        if (oldModel == null)
            throw new Exception("Can't find PermissionModel");

        //开始重置
        oldModel.OrgUnits.Clear();
        if (ouids != null)
        {
            foreach (var ouid in ouids)
            {
                oldModel.OrgUnits.Add(ouid);
            }
        }

        //保存权限模型
        await using var txn = await SqlStore.Default.BeginTransactionAsync();
        await MetaStore.Provider.UpdateModelAsync(oldModel, txn, RuntimeContext.GetApplication);
        await txn.CommitAsync();

        //更新本地模型缓存
        RuntimeContext.Current.InvalidModelsCache(null, new[] { oldModel.Id }, true);
        //TODO: 激发事件通知集群更新缓存
        return true;
    }

    /// <summary>
    /// Only for test
    /// </summary>
    private static ValueTask<string> Hello(string name)
    {
        return new ValueTask<string>($"Hello {name}");
    }

    public async ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        return method.Span switch
        {
            nameof(Login) => AnyValue.From(await Login(args.GetString()!, args.GetString()!)),
            "GetViewAssemblies" => AnyValue.From(await MetaStore.Provider.LoadViewAssembliesAsync(args.GetString()!)),
            "LoadAppAssembly" => AnyValue.From(await MetaStore.Provider.LoadAppAssemblyAsync(args.GetString()!)),
            "LoadDynamicViewJson" => AnyValue.From(
                await MetaStore.Provider.LoadDynamicViewJsonAsync(args.GetLong()!.Value)),
            "LoadDynamicWidgets" => AnyValue.From(await MetaStore.Provider.LoadDynamicWidgetsAsync()),
            "HasPermission" => AnyValue.From(HostRuntimeContext.HasPermission(args.GetLong()!.Value)),
            nameof(LoadPermissionTree) => AnyValue.From(await LoadPermissionTree()),
            nameof(SavePermission) => AnyValue.From(await SavePermission(args.GetString()!, args.GetArray<Guid>())),
            nameof(Hello) => AnyValue.From(await Hello(args.GetString()!)),
            _ => throw new Exception($"Can't find method: {method}")
        };
    }
}