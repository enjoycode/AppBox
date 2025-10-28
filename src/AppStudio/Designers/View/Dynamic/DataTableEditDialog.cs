using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

/// <summary>
/// 编辑数据表视图状态的对话框
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
            : base(tableState)
        {
            _designController = designController;
        }

        private readonly DesignController _designController;

        protected override string[] GetStates(DataTableFromQuery.FilterItem s)
        {
            //TODO:暂只支持EntityField
            if (s.Field is EntityFieldExpression field)
            {
                var model = RuntimeContext.GetModel<EntityModel>(field.Owner!.ModelId);
                var member = (EntityFieldModel)model.GetMember(field.Name)!;
                var dynamicStateType = member.FieldType switch
                {
                    EntityFieldType.String => DynamicStateType.String,
                    EntityFieldType.DateTime => DynamicStateType.DateTime,
                    EntityFieldType.Int => DynamicStateType.Int,
                    EntityFieldType.Float => DynamicStateType.Float,
                    EntityFieldType.Double => DynamicStateType.Double,
                    _ => throw new NotImplementedException()
                };
                return _designController.FindPrimitiveStates(dynamicStateType, member.AllowNull)
                    .Select(state => state.Name)
                    .ToArray();
            }

            return [];
        }
    }

    private class DataTableFromServiceEditor : DataTableFromServiceEditorBase
    {
        public DataTableFromServiceEditor(DesignController designController, DynamicDataTable tableState)
            : base(tableState)
        {
            _designController = designController;
        }

        private readonly DesignController _designController;

        protected override string[] FindStates(DynamicStateType type, bool allowNull)
        {
            return _designController.FindPrimitiveStates(type, allowNull).Select(s => s.Name).ToArray();
        }
    }
}