using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class RowStateEditDialog : Dialog
{
    public RowStateEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataRow Settings";
        Width = 630;
        Height = 450;

        _designController = designController;
        //初始化状态
        if (state.Value == null)
        {
            _rowState = new DynamicDataRow();
            _rowState.Source = new DynamicRowFromQuery(); //默认来源动态查询
            state.Value = _rowState;
        }
        else
        {
            _rowState = (DynamicDataRow)state.Value;
        }

        if (_rowState.Source == null!)
            _rowState.Source = new DynamicRowFromQuery();

        // _isFromQuery = MakeStateOfIsFromQuery();
        // _isFromQuery.AddListener(_ => _tableState.Reset()); //改变数据源类型重置绑定组件的相关配置
    }

    private readonly DesignController _designController;
    private readonly DynamicDataRow _rowState;
    // private readonly State<bool> _isFromQuery;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(10),
            Child = new RowStateFromQueryEditor(_designController, _rowState)
        };
    }
}