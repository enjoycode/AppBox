using System.Numerics;
using System.Text;

namespace AppBoxCore;

/// <summary>
/// 维度定义
/// </summary>
public sealed class Dimension<TData>
{
    public Dimension(string name, Func<TData, string> valueGetter)
    {
        Name = name;
        ValueGetter = valueGetter;
    }

    /// <summary>
    /// 维度名称 eg: 行政区域
    /// </summary>
    public string Name { get; }

    /// <summary>
    /// eg: data => data.Region
    /// </summary>
    public Func<TData, string> ValueGetter { get; } //TODO: 分拆为KeyGetter and NameGetter

    public override string ToString() => Name;
}

/// <summary>
/// 度量定义
/// </summary>
public sealed class Measure<TData, TMeasure> where TMeasure : INumber<TMeasure>
{
    public Measure(string name, Func<IEnumerable<TData>, TMeasure> aggregator)
    {
        Name = name;
        Aggregator = aggregator;
    }

    /// <summary>
    /// 度量名称 eg: 金额合计
    /// </summary>
    public string Name { get; }

    public Func<IEnumerable<TData>, TMeasure> Aggregator { get; }

    public override string ToString() => Name;
}

/// <summary>
/// 维度Key
/// </summary>
public sealed class GroupKey : IEquatable<GroupKey>
{
    internal GroupKey(IEnumerable<string> dimensions)
    {
        Values = dimensions.ToArray();
        var hash = new HashCode();
        foreach (var d in Values)
            hash.Add(d);
        _hashCode = hash.ToHashCode();
    }

    private readonly int _hashCode;
    public string[] Values { get; }

    public bool Equals(GroupKey? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return Values.AsSpan().SequenceEqual(other.Values);
    }

    public override bool Equals(object? obj) => ReferenceEquals(this, obj) || obj is GroupKey other && Equals(other);

    public override int GetHashCode() => _hashCode;

    public override string ToString()
    {
        if (Values.Length == 0) return string.Empty;
        if (Values.Length == 1) return Values[0];
        return string.Join('|', Values);
    }
}

/// <summary>
/// 查询条件
/// </summary>
public sealed class CubeQuery<TData, TMeasure> where TMeasure : INumber<TMeasure>
{
    // 行维度（纵向分组），如 [Region, City]
    public List<Dimension<TData>> RowDims = [];

    // 列维度（横向分组），如 [Salesman]
    public List<Dimension<TData>> ColDims = [];

    // 度量
    public Measure<TData, TMeasure> Measure { get; set; } = null!;

    // 过滤条件
    public Func<TData, bool>? Filter;

    /// <summary>
    /// 执行多维查询，返回交叉表
    /// </summary>
    public CubeResult<TMeasure> Query(IEnumerable<TData> data)
    {
        // ① 过滤
        var filtered = Filter == null ? data : data.Where(Filter);

        // ② 两级分组聚合阶段 (O(N) 复杂度)
        // 结构: RowKey -> (ColKey -> List<Data>)
        var rowGroupMap = filtered
            .GroupBy(r => new GroupKey(RowDims.Select(d => d.ValueGetter(r))))
            .Select(rg => new
            {
                RowKey = rg.Key,
                // 在行内部再次进行列分组
                ColMap = rg.GroupBy(r => new GroupKey(ColDims.Select(d => d.ValueGetter(r))))
                    .ToDictionary(cg => cg.Key, cg => cg.ToList())
            })
            .ToList();

        // ③ 提取所有唯一的行标签和列标签 (用于确定矩阵行列索引)
        var allRowKeys = rowGroupMap.Select(x => x.RowKey).ToList();
        var allColKeys = rowGroupMap
            .SelectMany(x => x.ColMap.Keys)
            .Distinct()
            .ToList();

        // ④ 构建矩阵
        int rowCount = allRowKeys.Count;
        int colCount = allColKeys.Count;
        var matrix = new TMeasure[rowCount, colCount];

        for (int i = 0; i < rowCount; i++)
        {
            var rowEntry = rowGroupMap[i];
            for (int j = 0; j < colCount; j++)
            {
                // 检查当前行内是否存在该列的键
                if (rowEntry.ColMap.TryGetValue(allColKeys[j], out var items))
                    matrix[i, j] = Measure.Aggregator(items);
                else
                    matrix[i, j] = default; // 填充默认值
            }
        }

        // ⑤ 构建行/列标题展示数据
        var rowHeaders = allRowKeys.Select(k => k.Values).ToArray();
        var colHeaders = allColKeys.Select(k => k.Values).ToArray();

        return new CubeResult<TMeasure>
        {
            RowHeaders = rowHeaders,
            ColHeaders = colHeaders,
            Data = matrix,
            MeasureName = Measure.Name
        };
    }
}

/// <summary>
/// 查询结果
/// </summary>
public sealed class CubeResult<TMeasure> where TMeasure : INumber<TMeasure>
{
    public string[][] RowHeaders { get; internal set; } = [];
    public string[][] ColHeaders { get; internal set; } = [];
    public TMeasure[,] Data { get; internal set; } = null!;
    public string MeasureName { get; init; } = null!;

    /// <summary>
    /// 根据指定的列索引，对整个表格的【行】进行重新排序
    /// </summary>
    public void OrderByColumn(int columnIndex, bool descending = false)
    {
        int rowCount = RowHeaders.Length;
        int colCount = ColHeaders.Length;

        if (rowCount == 0 || columnIndex < 0 || columnIndex >= colCount) return;

        // 1. Generate sorted indices based on the direction
        IEnumerable<int> sortedIndicesQuery = Enumerable.Range(0, rowCount);

        if (descending)
            sortedIndicesQuery = sortedIndicesQuery.OrderByDescending(r => Data[r, columnIndex]);
        else
            sortedIndicesQuery = sortedIndicesQuery.OrderBy(r => Data[r, columnIndex]);

        int[] sortedRowIndices = sortedIndicesQuery.ToArray();

        // 2. Reconstruct RowHeaders
        var newRowHeaders = new string[rowCount][];
        for (int i = 0; i < rowCount; i++)
        {
            newRowHeaders[i] = RowHeaders[sortedRowIndices[i]];
        }

        // 3. Reconstruct Data matrix
        var newData = new TMeasure[rowCount, colCount];
        for (int i = 0; i < rowCount; i++)
        {
            int oldRowIdx = sortedRowIndices[i];
            for (int j = 0; j < colCount; j++)
            {
                newData[i, j] = Data[oldRowIdx, j];
            }
        }

        // 4. Update properties
        RowHeaders = newRowHeaders;
        Data = newData;
    }

    /// <summary>
    /// /// <summary>
    /// 根据指定的行索引，对该行内的【列】进行重新排序
    /// </summary>
    /// </summary>
    public void OrderByRow(int rowIndex, bool descending = false)
    {
        int rowCount = RowHeaders.Length;
        int colCount = ColHeaders.Length;

        if (rowCount == 0 || rowIndex < 0 || rowIndex >= rowCount) return;

        // 1. Generate sorted indices based on the direction
        IEnumerable<int> sortedIndicesQuery = Enumerable.Range(0, colCount);

        if (descending)
            sortedIndicesQuery = sortedIndicesQuery.OrderByDescending(c => Data[rowIndex, c]);
        else
            sortedIndicesQuery = sortedIndicesQuery.OrderBy(c => Data[rowIndex, c]);

        int[] sortedColIndices = sortedIndicesQuery.ToArray();

        // 2. Reconstruct ColHeaders
        var newColHeaders = new string[colCount][];
        for (int j = 0; j < colCount; j++)
        {
            newColHeaders[j] = ColHeaders[sortedColIndices[j]];
        }

        // 3. Reconstruct Data matrix
        var newData = new TMeasure[rowCount, colCount];
        for (int i = 0; i < rowCount; i++)
        {
            for (int j = 0; j < colCount; j++)
            {
                newData[i, j] = Data[i, sortedColIndices[j]];
            }
        }

        // 4. Update properties
        ColHeaders = newColHeaders;
        Data = newData;
    }

    /// <summary>
    /// 用于比较 string[] 的比较器，实现多级层级排序
    /// </summary>
    private class HeaderComparer : IComparer<string[]>
    {
        public int Compare(string[]? x, string[]? y)
        {
            if (ReferenceEquals(x, y)) return 0;
            if (x == null) return -1;
            if (y == null) return 1;

            // 逐级比较数组中的元素 (例如: 先比 Region, 再比 City)
            int minLen = Math.Min(x.Length, y.Length);
            for (int i = 0; i < minLen; i++)
            {
                int cmp = string.Compare(x[i], y[i], StringComparison.Ordinal);
                if (cmp != 0) return cmp;
            }

            // 如果前缀相同，长度短的排在前面
            return x.Length.CompareTo(y.Length);
        }
    }

    // 生成可读的文本表格
    public override string ToString()
    {
        var sb = new StringBuilder();
        int rows = RowHeaders.Length;
        int cols = ColHeaders.Length;
        int cellWidth = 15;

        // 1. 构建表头 (列维度)
        sb.AppendLine(new string('─', cellWidth * (cols + 1) + 2));
        sb.Append("".PadRight(cellWidth)); // 起始空白列
        foreach (var col in ColHeaders)
        {
            // 将维度组合转为字符串展示，例如 "华东 / 上海"
            var headerText = string.Join(" / ", col);
            sb.Append(headerText.PadRight(cellWidth));
        }

        sb.AppendLine();
        sb.AppendLine(new string('─', cellWidth * (cols + 1) + 2));

        // 2. 构建数据行
        for (int r = 0; r < rows; r++)
        {
            // 行标签前缀
            var rowPrefix = string.Join(" / ", RowHeaders[r]);
            sb.Append(rowPrefix.PadRight(cellWidth));

            for (int c = 0; c < cols; c++)
            {
                sb.Append(Data[r, c].ToString().PadRight(cellWidth));
            }

            sb.AppendLine();
        }

        sb.AppendLine(new string('─', cellWidth * (cols + 1) + 2));

        return sb.ToString();
    }
}