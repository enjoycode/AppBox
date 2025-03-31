using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class TableStateEditDialog : Dialog
{
    public TableStateEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataTable Settings";
        Width = 630;
        Height = 450;

        _designController = designController;
        //初始化状态
        if (state.Value == null)
        {
            _tableState = new DynamicDataTable();
            _tableState.Source = new DynamicTableFromQuery(); //默认来源动态查询
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
                if (_tableState.Source is DynamicTableFromQuery)
                    return;
                _tableState.Source = new DynamicTableFromQuery();
            }
            else
            {
                if (_tableState.Source is DynamicTableFromService)
                    return;
                _tableState.Source = new DynamicTableFromService();
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
                    () => new TableStateFromQueryEditor(_designController, _tableState),
                    () => new TableStateFromServiceEditor(_designController, _tableState)
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
}