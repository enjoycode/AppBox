using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public class CubeTest
{
    private static List<SaleRecord> _records = null!;
    private static Dimension<SaleRecord> _dimRegion = null!;
    private static Dimension<SaleRecord> _dimCity = null!;
    private static Dimension<SaleRecord> _dimSalesman = null!;

    [OneTimeSetUp]
    public static void Setup()
    {
        _records =
        [
            new() { Region = "华东", City = "上海", Salesman = "张三", Amount = 12000 },
            new() { Region = "华东", City = "上海", Salesman = "李四", Amount = 8500 },
            new() { Region = "华东", City = "杭州", Salesman = "张三", Amount = 15000 },
            new() { Region = "华东", City = "杭州", Salesman = "王五", Amount = 6200 },
            new() { Region = "华北", City = "北京", Salesman = "赵六", Amount = 22000 },
            new() { Region = "华北", City = "北京", Salesman = "孙七", Amount = 9800 },
            new() { Region = "华北", City = "天津", Salesman = "赵六", Amount = 7300 },
            new() { Region = "华北", City = "天津", Salesman = "周八", Amount = 11000 },
            new() { Region = "华南", City = "广州", Salesman = "吴九", Amount = 18500 },
            new() { Region = "华南", City = "广州", Salesman = "郑十", Amount = 5400 },
            new() { Region = "华南", City = "深圳", Salesman = "吴九", Amount = 14200 },
            new() { Region = "华南", City = "深圳", Salesman = "钱一", Amount = 10600 },
            new() { Region = "华东", City = "上海", Salesman = "王五", Amount = 9300 },
            new() { Region = "华北", City = "北京", Salesman = "张三", Amount = 16800 },
            new() { Region = "华南", City = "广州", Salesman = "赵六", Amount = 13400 },
            new() { Region = "华东", City = "杭州", Salesman = "李四", Amount = 7700 },
            new() { Region = "华北", City = "天津", Salesman = "孙七", Amount = 4500 },
            new() { Region = "华南", City = "深圳", Salesman = "郑十", Amount = 12100 },
            new() { Region = "华东", City = "上海", Salesman = "张三", Amount = 6800 },
            new() { Region = "华北", City = "北京", Salesman = "赵六", Amount = 15600 }
        ];

        _dimRegion = new Dimension<SaleRecord>("Region", s => s.Region);
        _dimSalesman = new Dimension<SaleRecord>("Salesman", s => s.Salesman);
        _dimCity = new Dimension<SaleRecord>("City", s => s.City);
    }

    [Test]
    public void 区域_销售人员_金额合计()
    {
        var result = new CubeQuery<SaleRecord, decimal>
        {
            RowDims = [_dimRegion],
            ColDims = [_dimSalesman],
            Measure = new Measure<SaleRecord, decimal>("金额合计", g => g.Sum(i => i.Amount)),
        }.Query(_records);
        Console.WriteLine(result);
    }

    [Test]
    public void 区域_城市_销售人员_金额合计()
    {
        var result = new CubeQuery<SaleRecord, decimal>
        {
            RowDims = [_dimRegion, _dimCity],
            ColDims = [_dimSalesman],
            Measure = new Measure<SaleRecord, decimal>("金额合计", g => g.Sum(i => i.Amount)),
        }.Query(_records);
        Console.WriteLine(result);
    }

    [Test]
    public void 区域_交易笔数()
    {
        var result = new CubeQuery<SaleRecord, int>
        {
            RowDims = [_dimRegion],
            ColDims = [],
            Measure = new Measure<SaleRecord, int>("交易笔数", g => g.Count()),
        }.Query(_records);
        Console.WriteLine(result);
    }

    [Test]
    public void 华东_城市_销售人员_金额平均()
    {
        var result = new CubeQuery<SaleRecord, decimal>
        {
            RowDims = [_dimCity],
            ColDims = [_dimSalesman],
            Measure = new Measure<SaleRecord, decimal>("金额均值", g => g.Average(i => i.Amount)),
            Filter = item => item.Region == "华东",
        }.Query(_records);
        Console.WriteLine(result);
    }

    private sealed class SaleRecord
    {
        public string Region { get; init; } = string.Empty; // 区域：华东 / 华北 / 华南
        public string City { get; init; } = string.Empty; // 城市
        public string Salesman { get; init; } = string.Empty; // 销售人员
        public decimal Amount { get; init; } // 销售金额
    }
}