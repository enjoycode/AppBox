using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

/// <summary>
/// 编辑动态视图的数据表状态的对话框
/// </summary>
internal sealed class DataTableEditDialog : Dialog
{
    public DataTableEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataTable Settings";
        Width = 630;
        Height = 450;

        _designController = designController;
        //初始化状态
        if (state.Value == null)
        {
            _tableState = new DynamicDataTable();
            _tableState.Source = new DataTableFromQuery(); //默认来源动态查询
            state.Value = _tableState;
        }
        else
        {
            _tableState = (DynamicDataTable)state.Value;
        }

        _isFromQuery = MakeStateOfIsFromQuery();
        _isFromQuery.AddListener(_ => _tableState.Reset()); //改变数据源类型重置绑定组件的相关配置
    }

    private readonly DesignController _designController;
    private readonly DynamicDataTable _tableState;
    private readonly State<bool> _isFromQuery;

    private RxProxy<bool> MakeStateOfIsFromQuery() => new(
        () => _tableState.Source.SourceType == DynamicDataTable.FromQuery,
        v =>
        {
            if (v)
            {
                if (_tableState.Source is DataTableFromQuery)
                    return;
                _tableState.Source = new DataTableFromQuery();
            }
            else
            {
                if (_tableState.Source is DataTableFromService)
                    return;
                _tableState.Source = new DataTableFromService();
            }
        });

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Column()
        {
            Children =
            [
                new Row()
                {
                    Children =
                    [
                        new Radio(_isFromQuery),
                        new Text("From Query"),
                        new Radio(_isFromQuery.ToReversed()),
                        new Text("From Service"),
                    ]
                },
                new IfConditional(_isFromQuery,
                    () => new DataTableFromQueryEditor(_designController, _tableState),
                    () => new DataTableFromServiceEditor(_designController, _tableState)
                )
            ]
        }
    };

    // protected override bool OnClosing(string result)
    // {
    //     if (result != DialogResult.OK) return false;
    //     
    //     //检查是否全部绑定参数
    // }

    private class DataTableFromQueryEditor : DataTableFromQueryEditorBase
    {
        public DataTableFromQueryEditor(DesignController designController, DynamicDataTable tableState)
            : base((DataTableFromQuery)tableState.Source)
        {
            _designController = designController;
            _tableState = tableState;
        }

        private readonly DesignController _designController;
        private readonly DynamicDataTable _tableState;

        protected override void OnTargetChanged(State entityTarget)
        {
            //变更后调用DataChanged事件通知绑定对象重置(eg: 表格移除所有列)
            _tableState.Reset();
        }

        protected override string[] FindStates(DynamicStateType type, bool allowNull)
        {
            return _designController.FindPrimitiveStates(type, allowNull)
                .Select(state => state.Name)
                .ToArray();
        }
    }

    private class DataTableFromServiceEditor : DataTableFromServiceEditorBase
    {
        public DataTableFromServiceEditor(DesignController designController, DynamicDataTable tableState)
            : base((DataTableFromService)tableState.Source)
        {
            _designController = designController;
        }

        private readonly DesignController _designController;

        protected override string[] FindStates(DynamicStateType type, bool allowNull)
        {
            return _designController.FindPrimitiveStates(type, allowNull)
                .Select(s => s.Name)
                .ToArray();
        }
    }
}