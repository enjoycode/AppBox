using AppBoxClient.Dynamic;
using AppBoxClient.Dynamic.Events;
using AppBoxCore;
using AppBoxDesign;
using AppBoxStore.Entities;
using NUnit.Framework;
using PixUI.Dynamic;

namespace Tests.ClientUI;

public class DynamicViewSerializationTest
{
    [SetUp]
    public static Task Setup() => DynamicInitiator.TryInitAsync(true);

    [Test]
    public void DynamicStateTest()
    {
        var root = new EntityExpression(Employee.MODELID, null);
        var query = new DataTableFromQuery() { Root = root };
        query.AddSelect("姓名", root.F("Name"), DataType.String);
        query.AddSelect("性别", root.F("Male"), DataType.Bool);
        query.AddOrderBy(root.F("Name"), true);
        query.AddFilter(root.F("Male"), BinaryOperatorType.Equal, "male");

        var state1 = new DynamicState()
            { Name = "员工", Type = DynamicStateType.DataTable, Value = new DynamicDataTable() { Source = query } };

        using var ms = new MemoryStream();
        var writer = new SystemWriteStream(ms);
        writer.WriteState(state1);

        ms.Position = 0;
        var reader = new SystemReadStream(ms);
        var state2 = reader.ReadState(DynamicInitiator.CreateStateValue);
        Assert.IsTrue(state2 != null!);
        Assert.IsTrue(ms.Position == ms.Length);
    }

    [Test]
    public void DynamicEventTest()
    {
        var showDlg = new ShowDialog()
        {
            Title = "客户详情",
            DialogWidth = 500,
            DialogHeight = 400,
            TargetViewId = 12345678,
            Parameters =
            {
                new ViewParameter()
                {
                    StateName = "customer.Id",
                    Source = new FetchRowParameter().AddPrimaryKey("customer.Id", "Id")
                }
            }
        };

        var dynamicEvent1 = new EventValue() { Name = "edit", Action = showDlg };

        using var ms = new MemoryStream();
        var writer = new SystemWriteStream(ms);
        writer.WriteEventValue(dynamicEvent1);

        ms.Position = 0;
        var reader = new SystemReadStream(ms);
        var dynamicEvent2 = reader.ReadEventValue();
        Assert.IsTrue(dynamicEvent2 != null!);
        Assert.IsTrue(ms.Position == ms.Length);
    }

    // [Test]
    // public void DynamicWidgetTest()
    // {
    //     var designController = new DesignController();
    //     var rootElement = new DesignElement(designController, string.Empty);
    //     
    // }
}