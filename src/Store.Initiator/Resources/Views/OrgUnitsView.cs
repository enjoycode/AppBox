using sys.Entities;

namespace sys.Views;

public sealed class OrgUnitsView : View
{
    public OrgUnitsView()
    {
        _orgTreeController = new TreeController<OrgUnit>(BuildTreeNode, data => data.Children!);
        _orgTreeController.SelectionChanged += OnOrgUnitChanged;

        Child = new Column
        {
            Children =
            {
                BuildCmdBar(),
                BuildBody(),
            }
        };

        LoadOrgTree();
    }

    private readonly TreeController<OrgUnit> _orgTreeController;
    private readonly TabController<string> _tabController = new(new List<string> { "组织单元属性", "权限设置" });
    private readonly State<OrgUnit?> _selectedOU = new RxValue<OrgUnit?>(null);
    private readonly RxEnterprise _entNotifier = new();
    private readonly RxWorkgroup _wkgNotifier = new();
    private readonly RxEmployee _empNotifier = new();

    private Widget BuildCmdBar()
    {
        return new Card
        {
            Child = new Container
            {
                Height = 40,
                Padding = EdgeInsets.All(5),
                Child = new ButtonGroup
                {
                    Children =
                    {
                        new Button("新建组", MaterialIcons.Group) { OnTap = OnNewWorkgroup },
                        new Button("新建员工", MaterialIcons.Person) { OnTap = OnNewEmployee },
                        new Button("保存", MaterialIcons.Save) { OnTap = OnSave },
                        new Button("删除", MaterialIcons.Delete)
                    }
                }
            }
        };
    }

    private Widget BuildBody()
    {
        return new Card
        {
            Child = new Row
            {
                Children =
                {
                    new Container
                    {
                        Width = 150,
                        Child = new TreeView<OrgUnit>(_orgTreeController)
                    },
                    new Container
                    {
                        Child = new TabView<string>(_tabController, BuildTab, BuildTabBody)
                    }
                }
            }
        };
    }

    private void BuildTreeNode(OrgUnit data, TreeNode<OrgUnit> node)
    {
        node.Label = new Text(data.Observe(e => e.Name));
        if (data.BaseType == Enterprise.MODELID)
        {
            node.Icon = new Icon(MaterialIcons.Home);
            node.IsLeaf = false;
            node.IsExpanded = true;
        }
        else if (data.BaseType == Workgroup.MODELID)
        {
            node.Icon = new Icon(MaterialIcons.Folder);
            node.IsLeaf = false;
            node.IsExpanded = true;
        }
        else
        {
            node.Icon = new Icon(MaterialIcons.Person);
            node.IsLeaf = true;
        }
    }

    private Widget BuildTab(string data, State<bool> isSelected)
    {
        return new Text(data);
    }

    private Widget BuildTabBody(string data)
    {
        if (data == "组织单元属性")
        {
            return new Conditional<OrgUnit?>(_selectedOU)
                .When(t => t != null && t.BaseType == Enterprise.MODELID,
                    () => new sys.Views.EnterpriseView(_entNotifier))
                .When(t => t != null && t.BaseType == Workgroup.MODELID,
                    () => new sys.Views.WorkgroupView(_wkgNotifier))
                .When(t => t != null && t.BaseType == Employee.MODELID,
                    () => new sys.Views.EmployeeView(_empNotifier));
        }

        return new sys.Views.PermissionTreeView { CurrentOU = _selectedOU };
    }

    private async void LoadOrgTree()
    {
        try
        {
            var list = await sys.Services.OrgUnitService.LoadTree();
            _orgTreeController.DataSource = list;
            //选中根节点
            //var rootNode = _orgTreeController.FindNode(t => t.Id == list[0].Id)!;
            _orgTreeController.SelectNode(_orgTreeController.RootNodes[0]);
        }
        catch (Exception ex)
        {
            Notification.Error($"无法加载组织结构: {ex}");
        }
    }

    private async void OnOrgUnitChanged()
    {
        var ou = _orgTreeController.FirstSelectedNode?.Data;
        _selectedOU.Value = ou;
        if (ou == null) return;

        if (ou.Base == null) //尚未加载过
        {
            if (ou.BaseType == Enterprise.MODELID)
                ou.Base = await sys.Services.OrgUnitService.FetchEnterprise(ou.Id);
            else if (ou.BaseType == Workgroup.MODELID)
                ou.Base = await sys.Services.OrgUnitService.FetchWorkgroup(ou.Id);
            else
                ou.Base = await sys.Services.OrgUnitService.FetchEmployee(ou.Id);
        }
        //通知组织单元属性面板更改
        if (ou.BaseType == Enterprise.MODELID)
            _entNotifier.Target = (Enterprise)ou.Base!;
        else if (ou.BaseType == Workgroup.MODELID)
            _wkgNotifier.Target = (Workgroup)ou.Base!;
        else
            _empNotifier.Target = (Employee)ou.Base!;
    }

    private async void OnNewWorkgroup(PointerEvent e)
    {
        if (!CheckForCreate()) return;

        var parentNode = _orgTreeController.FirstSelectedNode;
        var parentOU = _selectedOU.Value!;
        var newOU = await sys.Services.OrgUnitService.NewWorkgroup(parentOU.Id);
        //TODO:暂加入至最后一个位置
        _orgTreeController.InsertNode(newOU, parentNode);
    }

    private async void OnNewEmployee(PointerEvent e)
    {
        if (!CheckForCreate()) return;

        var parentNode = _orgTreeController.FirstSelectedNode;
        var parentOU = _selectedOU.Value!;
        var newOU = await sys.Services.OrgUnitService.NewEmployee(parentOU.Id);
        _orgTreeController.InsertNode(newOU, parentNode);
    }

    private bool CheckForCreate()
    {
        if (_selectedOU.Value == null)
        {
            Notification.Error("请先选择上级节点");
            return false;
        }
        if (_selectedOU.Value.BaseType == Employee.MODELID)
        {
            Notification.Error("请选择非员工节点作为上级");
            return false;
        }

        return true;
    }

    private async void OnSave(PointerEvent e)
    {
        var ou = _selectedOU.Value;
        if (ou == null) return;

        if (ou.Base is Workgroup workgroup)
        {
            await sys.Services.OrgUnitService.SaveWorkgroup(workgroup, ou.Id, ou.Name);
            ou.Name = workgroup.Name;
        }
        else if (ou.Base is Employee employee)
        {
            await sys.Services.OrgUnitService.SaveEmployee(employee, ou.Id, ou.Name);
            ou.Name = employee.Name;
        }
    }
}