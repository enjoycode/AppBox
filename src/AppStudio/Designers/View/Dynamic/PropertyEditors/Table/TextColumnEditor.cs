using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;
using DynamicTable = AppBoxCore.DynamicTable;

namespace AppBoxDesign.PropertyEditors;

internal sealed class TextColumnEditor : TableColumnEditor<TextColumnSettings>
{
    public TextColumnEditor(RxObject<TextColumnSettings> obj, DesignElement element) : base(obj, element) { }

    private Select<string> _fieldRef = null!;
    private DynamicFieldInfo[]? _allFields;

    protected override IEnumerable<(string, State, Widget)> GetExtProps()
    {
        var field = Column.Observe(nameof(TextColumnSettings.Field),
            s => s.Field, (s, v) => s.Field = v);
        var autoMergeCells = Column.Observe(nameof(TextColumnSettings.AutoMergeCells),
            s => s.AutoMergeCells, (s, v) => s.AutoMergeCells = v);
        var cellStyles = Column.Observe(nameof(TextColumnSettings.CellStyles),
            s => s.CellStyles, (s, v) => s.CellStyles = v);

        yield return ("Field:", field, new Select<string>(field!).RefBy(ref _fieldRef));
        yield return ("CellStyles:", cellStyles, new Button("...")
        {
            Width = float.MaxValue, OnTap = _ => OnEditCellStyles(cellStyles)
        });
        yield return ("MergeCells:", autoMergeCells, new Switch(autoMergeCells));
    }

    protected override void OnMounted() => FetchDataSourceFields();

    private async void FetchDataSourceFields()
    {
        Element.Data.TryGetPropertyValue(nameof(AppBoxClient.Dynamic.DynamicTableView.DataSource), out var dataSourceValue);
        if (dataSourceValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSource");
            return;
        }

        var dsState = Element.Controller.FindState(dsName);
        if (dsState?.Value is not IDynamicTable dsSettings) return;
        if (await dsSettings.GetRuntimeState(Element.Controller.DesignCanvas) is not DynamicTable ds) return;

        _allFields = ds.Fields;
        var fields = _allFields.Select(f => f.Name).ToArray();
        _fieldRef.Options = fields;
    }

    private async void OnEditCellStyles(State<ConditionalCellStyle[]?> cellStyles)
    {
        var fieldName = _fieldRef.Value.Value;
        if (string.IsNullOrEmpty(fieldName))
        {
            Notification.Warn("尚未设置字段");
            return;
        }

        var fieldInfo = _allFields!.Single(f => f.Name == fieldName);
        if (!fieldInfo.IsNumber)
        {
            Notification.Error("只支持数值类型的字段");
            return;
        }

        var list = new List<ConditionalCellStyle>();
        if (cellStyles.Value != null)
            list.AddRange(cellStyles.Value);

        var dlg = new CellStylesDialog(list);
        var res = await dlg.ShowAsync();
        if (res != DialogResult.OK) return;

        cellStyles.Value = list.Count == 0 ? null : list.ToArray();
    }
}

internal sealed class CellStylesDialog : Dialog
{
    public CellStylesDialog(List<ConditionalCellStyle> list)
    {
        Title.Value = "Conditional Cell Style";
        Width = 580;
        Height = 425;

        _dgController.DataSource = list;
    }

    private readonly DataGridController<ConditionalCellStyle> _dgController = new();

    protected override Widget BuildBody()
    {
        var options = new[] { ">", ">=", "<", "<=", "==", "!=" };

        return new Container
        {
            Padding = EdgeInsets.All(20),
            Child = new DataGrid<ConditionalCellStyle>(_dgController)
                .AddHostColumn("比较", (s, _) => new Select<string>(MakeComparerState(s)) { Options = options }, 80)
                .AddHostColumn("值", (s, _) => new NumberInput<double>(MakeNumberState(s)), 120)
                .AddHostColumn("文本颜色", (s, _) => new ColorEditor(MakeTextColorState(s), null!))
                .AddHostColumn("背景颜色", (s, _) => new ColorEditor(MakeFillColorState(s), null!))
        };
    }

    protected override Widget BuildFooter() => new Container
    {
        Height = Button.DefaultHeight + 20 + 20,
        Padding = EdgeInsets.All(20),
        Child = new Row(VerticalAlignment.Middle, 20)
        {
            Children =
            {
                new Expanded(),
                new Button("添加条件") { Width = 80, OnTap = _ => OnAdd() },
                new Button("删除条件") { Width = 80, OnTap = _ => OnRemove() },
                new Button(DialogResult.Cancel) { Width = 80, OnTap = _ => Close(DialogResult.Cancel) },
                new Button(DialogResult.OK) { Width = 80, OnTap = _ => Close(DialogResult.OK) }
            }
        }
    };

    private void OnAdd() => _dgController.Add(new ConditionalCellStyle());

    private void OnRemove()
    {
        var index = _dgController.CurrentRowIndex;
        if (index >= 0)
            _dgController.RemoveAt(index);
    }

    private static RxProxy<string?> MakeComparerState(ConditionalCellStyle s) => new(
        () => s.Comparer switch
        {
            Comparer.Greater => ">",
            Comparer.GreaterOrEqual => ">=",
            Comparer.Less => "<",
            Comparer.LessOrEqual => "<=",
            Comparer.Equal => "==",
            Comparer.NotEqual => "!=",
            _ => throw new NotSupportedException()
        },
        v => s.Comparer = v switch
        {
            ">" => Comparer.Greater,
            ">=" => Comparer.GreaterOrEqual,
            "<" => Comparer.Less,
            "<=" => Comparer.LessOrEqual,
            "==" => Comparer.Equal,
            "!=" => Comparer.NotEqual,
            _ => s.Comparer
        });

    private static RxProxy<double> MakeNumberState(ConditionalCellStyle s) =>
        new(() => s.Comparand, v => s.Comparand = v);

    private static RxProxy<Color?> MakeTextColorState(ConditionalCellStyle s) =>
        new(() => s.TextColor, v => s.TextColor = v);

    private static RxProxy<Color?> MakeFillColorState(ConditionalCellStyle s) =>
        new(() => s.FillColor, v => s.FillColor = v);
}