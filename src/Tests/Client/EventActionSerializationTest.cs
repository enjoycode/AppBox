using System.Text;
using AppBoxClient.Dynamic;
using NUnit.Framework;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace Tests.ClientUI;

public class EventActionSerializationTest
{
    [Test]
    public void Test1()
    {
        const string json = """
                            {
                              "View": {
                                "Type": "Center",
                                "Child": {
                                  "Type": "Button",
                                  "TextColor": { "Const": "FFFF0000" },
                                  "Events": { "OnTap": { "Handler": "FetchDataSet", "DataSet": "orders" } }
                                }
                              }
                            }
                            """;
        DynamicWidgetManager.TryInitEventActionManager(() => new EventActionManager());
        var controller = new DesignController();
        var canvas = new DesignCanvas(controller);
        controller.Load(Encoding.UTF8.GetBytes(json));
    }
}