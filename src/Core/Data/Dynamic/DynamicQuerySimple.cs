namespace AppBoxCore;

/// <summary>
/// 不用表达式的简化版动态查询
/// </summary>
public sealed class DynamicQuerySimple
{
    public ModelId ModelId { get; set; }

    public int PageSize { get; set; }

    public int PageIndex { get; set; }

    public SelectItem[] Selects { get; set; } = null!;

    public FilterItem[]? Filters { get; set; }

    public OrderByItem[]? Orders { get; set; }

    public readonly struct SelectItem
    {
        public SelectItem(string alias, string item, DataType type)
        {
            Alias = alias;
            Item = item;
            Type = type;
        }

        public readonly string Item;
        public readonly DataType Type;
        public readonly string Alias;
    }

    public readonly struct FilterItem
    {
        public FilterItem(string field, BinaryOperatorType op, object? value)
        {
            Field = field;
            Operator = op;
            Value = value;
        }

        public readonly string Field;
        public readonly BinaryOperatorType Operator;
        public readonly object? Value;
    }

    public readonly struct OrderByItem
    {
        public OrderByItem(string field, bool descending = false)
        {
            Field = field;
            Descending = descending;
        }

        public readonly string Field;
        public readonly bool Descending;
    }
}