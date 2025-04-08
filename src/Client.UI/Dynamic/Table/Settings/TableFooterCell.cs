using System.ComponentModel;
using System.Globalization;
using System.Runtime.CompilerServices;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public enum TableFooterCellType
{
    Text,
    Sum,
    Avg
}

public sealed class TableFooterCell : INotifyPropertyChanged
{
    private int _beginColumn;
    private int _endColumn;
    private string _text = string.Empty;
    private TableFooterCellType _type;
    private int _decimals;

    public int BeginColumn
    {
        get => _beginColumn;
        set => SetField(ref _beginColumn, value);
    }

    public int EndColumn
    {
        get => _endColumn;
        set => SetField(ref _endColumn, value);
    }

    public string Text
    {
        get => _text;
        set => SetField(ref _text, value);
    }

    public TableFooterCellType Type
    {
        get => _type;
        set => SetField(ref _type, value);
    }

    public int Decimals
    {
        get => _decimals;
        set => SetField(ref _decimals, value);
    }

    public TableFooterCell Clone() => new()
        { BeginColumn = BeginColumn, EndColumn = EndColumn, Text = Text, Type = Type, Decimals = Decimals };

    internal DataGridFooterCell Build(DynamicTableView table)
    {
        //TODO:聚合暂转换为Double处理
        switch (Type)
        {
            case TableFooterCellType.Text:
                return new DataGridFooterCell(BeginColumn, EndColumn < BeginColumn ? BeginColumn : EndColumn)
                    { Text = Text };
            case TableFooterCellType.Sum:
                return new DataGridFooterCell(BeginColumn, () => Calc(table));
            case TableFooterCellType.Avg:
                return new DataGridFooterCell(BeginColumn, () => Calc(table));
            default:
                throw new NotImplementedException();
        }
    }

    private string Calc(DynamicTableView table)
    {
        if (table.Columns == null || table.Columns.Length == 0)
            return string.Empty;

        var leafColumns = new List<TableColumnSettings>();
        foreach (var column in table.Columns)
        {
            GetLeafColumns(column, leafColumns);
        }

        var col = leafColumns[BeginColumn];
        string? fieldName = null;
        if (col is ITableFieldColumn fieldColumn)
            fieldName = fieldColumn.Field;
        if (string.IsNullOrEmpty(fieldName))
            return string.Empty;

        var dataView = table.Controller.DataView;
        if (dataView == null || dataView.Count == 0)
            return "0";

        Func<DataRow, double> getFieldValue = t => t.HasValue(fieldName) ? (t[fieldName].ToDouble() ?? 0.0) : 0.0;
        var agg = Type switch
        {
            TableFooterCellType.Sum => dataView.Sum(getFieldValue),
            TableFooterCellType.Avg => dataView.Average(getFieldValue),
            _ => 0.0
        };

        return _decimals >= 0 ? agg.ToString($"F{_decimals}") : agg.ToString(CultureInfo.InvariantCulture);
    }

    private static void GetLeafColumns(TableColumnSettings column, List<TableColumnSettings> leafColumns)
    {
        if (column is GroupColumnSettings groupColumn)
        {
            foreach (var child in groupColumn.Children)
            {
                GetLeafColumns(child, leafColumns);
            }
        }
        else
        {
            leafColumns.Add(column);
        }
    }

    #region ====INotifyPropertyChanged====

    public event PropertyChangedEventHandler? PropertyChanged;

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    private bool SetField<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value)) return false;
        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }

    #endregion
}