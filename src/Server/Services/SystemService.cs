using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 系统内置的一些服务，如初始化存储、密码Hash等
/// </summary>
internal sealed class SystemService : IService
{
    /// <summary>
    /// 用户登录时验证并返回组织单元的路径
    /// </summary>
    internal Task<TreePath> Login(string user, string password)
    {
        Log.Info($"用户登录: {user}");

        var path = new TreePath(new[]
        {
            new TreePathNode(Guid.NewGuid(), "Admin"),
            new TreePathNode(Guid.NewGuid(), "AppBox Corp.")
        });

        return Task.FromResult(path);
    }

    /// <summary>
    /// 用于前端组织结构权限管理界面加载整个权限树
    /// </summary>
    private async Task<IList<PermissionNode>> LoadPermissionTree()
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
                    Name = permision.Name, ModelId = permision.Id.ToString(),
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
    /// Only for test
    /// </summary>
    private ValueTask<string> Hello(string name)
    {
        return new ValueTask<string>($"Hello {name}");
    }

    public async ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        return method switch
        {
            _ when method.Span.SequenceEqual(nameof(Login)) => AnyValue.From(
                await Login(args.GetString()!, args.GetString()!)),
            _ when method.Span.SequenceEqual(nameof(LoadPermissionTree)) => AnyValue.From(
                await LoadPermissionTree()),
            _ when method.Span.SequenceEqual(nameof(Hello)) => AnyValue.From(
                await Hello(args.GetString()!)),
            _ => throw new Exception($"Can't find method: {method}")
        };
    }
}