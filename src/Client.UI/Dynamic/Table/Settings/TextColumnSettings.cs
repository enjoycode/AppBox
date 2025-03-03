using System;
using System.Linq;
using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class TextColumnSettings : TableColumnSettings, ITableFieldColumn
{
    [JsonIgnore] public override string Type => Text;

    private string _field = string.Empty;
    private bool _autoMergeCells;
    private ConditionalCellStyle[]? _cellStyles;

    public string Field
    {
        get => _field;
        set => SetField(ref _field, value);
    }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool AutoMergeCells
    {
        get => _autoMergeCells;
        set => SetField(ref _autoMergeCells, value);
    }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ConditionalCellStyle[]? CellStyles
    {
        get => _cellStyles;
        set => SetField(ref _cellStyles, value);
    }

    protected internal override DataGridColumn<DynamicEntity> BuildColumn(DataGridController<DynamicEntity> controller)
    {
        var cellStyle = new CellStyle
        {
            HorizontalAlignment = HorizontalAlignment,
            VerticalAlignment = VerticalAlignment
        };

        Func<DynamicEntity, int, CellStyle>? cellStyleGetter = null;
        if (CellStyles is { Length: > 0 })
            cellStyleGetter = BuildCellStylesGetter(controller);

        return new DataGridTextColumn<DynamicEntity>(Label,
            t => t.HasValue(Field) ? t[Field].ToStringValue() : string.Empty)
        {
            Width = Width,
            AutoMergeCells = AutoMergeCells,
            CellStyle = cellStyle,
            CellStyleGetter = cellStyleGetter,
        };
    }

    private Func<DynamicEntity, int, CellStyle> BuildCellStylesGetter(DataGridController<DynamicEntity> controller)
    {
        var conditions = new Func<DynamicEntity, bool>[CellStyles!.Length];
        for (var i = 0; i < conditions.Length; i++)
        {
            conditions[i] = BuildCondition(CellStyles[i], Field);
        }

        return (entity, _) =>
        {
            for (var i = 0; i < conditions.Length; i++)
            {
                if (conditions[i](entity))
                {
                    var cellStyle = controller.Theme.DefaultRowCellStyle.Clone();
                    if (CellStyles[i].TextColor != null)
                        cellStyle.TextColor = CellStyles[i].TextColor;
                    if (CellStyles[i].FillColor != null)
                        cellStyle.FillColor = CellStyles[i].FillColor;
                    return cellStyle;
                }
            }

            //没有满足所有条件，暂返回默认值
            return controller.Theme.DefaultRowCellStyle;
        };
    }

    private static Func<DynamicEntity, bool> BuildCondition(ConditionalCellStyle c, string field)
    {
        // var arg = System.Linq.Expressions.Expression.Parameter(typeof(DynamicEntity));
        // var agrValue = System.Linq.Expressions.Expression.MakeIndex()
        // var value = System.Linq.Expressions.Expression.Constant(c.Comparand);
        // var compType = c.Comparer switch
        // {
        //     Comparer.Greater => ExpressionType.GreaterThan,
        //     Comparer.GreaterOrEqual => ExpressionType.GreaterThanOrEqual,
        //     Comparer.Less => ExpressionType.LessThan,
        //     Comparer.LessOrEqual => ExpressionType.LessThanOrEqual,
        //     Comparer.Equal => ExpressionType.Equal,
        //     Comparer.NotEqual => ExpressionType.NotEqual,
        //     _ => throw new ArgumentOutOfRangeException()
        // };
        // var comp = System.Linq.Expressions.Expression.MakeBinary(compType, arg, value);
        // System.Linq.Expressions.Expression<Func<DynamicEntity, bool>> res = entity =>
        // {
        //     
        // };

        //暂用解释执行简单实现
        return s =>
        {
            if (!s.HasValue(field)) return false;
            var value = s[field].ToDouble();
            return c.Comparer switch
            {
                Comparer.Greater => value > c.Comparand,
                Comparer.GreaterOrEqual => value >= c.Comparand,
                Comparer.Less => value < c.Comparand,
                Comparer.LessOrEqual => value <= c.Comparand,
                Comparer.Equal => value == c.Comparand,
                Comparer.NotEqual => value != c.Comparand,
                _ => false
            };
        };
    }

    public override TableColumnSettings Clone() => new TextColumnSettings
    {
        Label = Label, Width = Width, Field = Field,
        HorizontalAlignment = HorizontalAlignment,
        VerticalAlignment = VerticalAlignment,
        AutoMergeCells = AutoMergeCells,
        CellStyles = CellStyles == null || CellStyles.Length == 0
            ? null
            : CellStyles.Select(c => c.Clone()).ToArray()
    };
}