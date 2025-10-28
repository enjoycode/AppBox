using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class DataRowEditDialog : Dialog
{
    public DataRowEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataRow Settings";
        Width = 630;
        Height = 450;

        _designController = designController;
        _state = state;
        //初始化状态
        if (state.Value == null)
        {
            var row = new DynamicDataRow();
            row.Source = new DataRowFromQuery(); //默认来源动态查询
            state.Value = row;
        }

        if (state.Value is DynamicDataRow dr && dr.Source == null!)
            dr.Source = new DataRowFromQuery();

        // _isFromQuery = MakeStateOfIsFromQuery();
        // _isFromQuery.AddListener(_ => _tableState.Reset()); //改变数据源类型重置绑定组件的相关配置
    }

    private readonly DesignController _designController;
    private readonly DynamicState _state;
    // private readonly State<bool> _isFromQuery;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(10),
            Child = new DataRowFromQueryEditor(_designController, _state)
        };
    }
}