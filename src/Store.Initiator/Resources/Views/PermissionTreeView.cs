using sys.Entities;

namespace sys.Views;

/// 权限树
public sealed class PermissionTreeView : View
{
    public PermissionTreeView()
    {
        _treeController.CheckChanged += OnCheckChanged;    

        Child = new TreeView<PermissionNode>(_treeController, true);
        LoadTreeAsync();
    }
    
    private State<OrgUnit?> _current = null!;
    private bool _suspendChecking = false;
    private readonly TreeController<PermissionNode> _treeController = new (
        BuildTreeNode, data => data.Children!);
    
    public State<OrgUnit?> CurrentOU
    {
        set => _current = Rebind(_current, value, BindingOptions.None)!;
    }
    
    private static void BuildTreeNode(PermissionNode data, TreeNode<PermissionNode> node)
    {
        node.Label = new Text(data.Name);
        node.IsLeaf = data.Children == null;
        node.IsExpanded = data.Children != null && data.Children.Count > 0;
    }
    
    public override void OnStateChanged(StateBase state, BindingOptions opts)
    {
        if (ReferenceEquals(state, _current))
        {
            OnCurrentChanged();
            return;
        }
        base.OnStateChanged(state, opts);
    }
    
    private async void LoadTreeAsync()
    {
        try
        {
            var list = await sys.Services.SystemService.LoadPermissionTree();
            _treeController.DataSource = list;
            OnCurrentChanged(); //强制刷新
        }
        catch(Exception ex)
        {
            Notification.Error($"无法加载权限树: {ex.Message}");
        }
    }
    
    private void OnCurrentChanged()
    {
        if (_current == null || _current.Value == null) return; //TODO: clear all checked
        
        _suspendChecking = true;
        foreach(var node in _treeController.RootNodes)
        {
            LoopCheckNodes(node);
        }
        _suspendChecking = false;
    }
    
    // 用户勾选改变权限节点
    private void OnCheckChanged(TreeNode<PermissionNode> node)
    {
        if (_suspendChecking || _current.Value == null || node.Data.ModelId == null) return;
        
        var ou = _current.Value;
        if (node.CheckState != null && node.CheckState.Value) // false -> true
        {
            //先移除当前组织所有已经具备相同权限的下级
            LoopRemoveChildPermission(ou, node.Data);
            //再添加当前ouid至当前权限，考虑向上提升权限
            node.Data.OrgUnits!.Add(ou.Id);
        }
        else
        {
            //TODO:确保不误删Admin用户的Admin权限
            LoopDemotion(ou, node.Data);
        }
        //调用服务保存更新
        SavePermission(node.Data);
    }
    
    // 组织单元改变时勾选具备的权限节点
    private void LoopCheckNodes(TreeNode<PermissionNode> node)
    {
        if (node.Data.OrgUnits != null) //表示权限节点
        {
            var cur = _current.Value;
            while(cur != null)
            {
                foreach(var ouid in node.Data.OrgUnits)
                {
                    if (cur.Id == ouid)
                    {
                        _treeController.SetChecked(node.Data, true);
                        return;
                    }
                }
                cur = cur.Parent;
            }
            _treeController.SetChecked(node.Data, false);
            return;
        }
        
        node.EnsureBuildChildren(); //必须确保已构建
        foreach(var child in node.Children!)
        {
            LoopCheckNodes(child);
        }
    }

    // false -> true时移除所有下级的权限，即所有下级的权限变为继承的
    private void LoopRemoveChildPermission(OrgUnit ou, PermissionNode pm)
    {
        if (ou.Children == null || ou.Children.Count == 0) return;
        
        foreach(var child in ou.Children)
        {
            var index = pm.OrgUnits!.IndexOf(child.Id);
            if (index >= 0)
                pm.OrgUnits.RemoveAt(index);
            //继续向下递归移除
            LoopRemoveChildPermission(child, pm);
        }
    }
    
    // true -> false时向上降级
    private void LoopDemotion(OrgUnit ou, PermissionNode pm)
    {
        // 先判断当前组织单元的权限是否继承而来
        var index = pm.OrgUnits!.IndexOf(ou.Id);
        if (index >= 0 ) //非继承的权限直接删除
        {
            pm.OrgUnits.RemoveAt(index);
            return;
        }
        
        //继承的权限
        if (ou.Parent == null) return;
        //添加同级所有非当前的组织单元的权限
        foreach(var child in ou.Parent.Children!)
        {
            if (child.Id != ou.Id)
                pm.OrgUnits.Add(child.Id);
        }
        //继续向上递归
        LoopDemotion(ou.Parent, pm);
    }
    
    // 保存变更后的权限模型
    private async void SavePermission(PermissionNode pm)
    {
        try
        {
            await sys.Services.SystemService.SavePermission(pm.ModelId!, pm.OrgUnits);
        }
        catch(Exception ex)
        {
            Notification.Error($"保存权限失败: {ex.Message}");
        }
    }

}