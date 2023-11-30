using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class DynamicTable : SingleChildWidget
{

    public DynamicTable()
    {
        Child = new DataGrid<DynamicEntity>(_dgController);
    }

    private readonly DataGridController<DynamicEntity> _dgController = new();
}