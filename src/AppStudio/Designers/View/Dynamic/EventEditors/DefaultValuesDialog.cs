using AppBoxClient.Dynamic.Events;
using AppBoxDesign.CodeGenerator;
using PixUI;

namespace AppBoxDesign.EventEditors;

/// <summary>
/// 用于CreateRow时设置字段默认值
/// </summary>
internal sealed class DefaultValuesDialog : Dialog
{
    public DefaultValuesDialog(CreateRowParameter createRowParameter)
    {
        Width = 580;
        Height = 430;
        Title.Value = "Default values for CreateRow";

        _createRowParameter = createRowParameter;
        _dgController.DataSource = createRowParameter.DefaultValues
            .Select(t => new DefaultValueWrapper(t))
            .ToList();
    }

    private readonly CreateRowParameter _createRowParameter;
    private readonly DataGridController<DefaultValueWrapper> _dgController = new();

    protected override Widget BuildBody() => new Container()
    {
        Padding = EdgeInsets.All(20),
        Child = new DataGrid<DefaultValueWrapper>(_dgController)
            .AddHostColumn("TargetState", (pk, _) =>
            {
                var s = new RxProxy<string>(() => pk.TargetStateName, v => pk.TargetStateName = v);
                return new TextInput(s) { Border = null };
            })
            .AddHostColumn("DefaultValue", (pk, _) =>
            {
                var s = new RxProxy<string>(() => pk.ValueExpression, v => pk.ValueExpression = v);
                return new TextInput(s) { Border = null };
            })
    };

    protected override Widget BuildFooter() => new Container
    {
        Height = Button.DefaultHeight + 20 + 20,
        Padding = EdgeInsets.All(20),
        Child = new Row(VerticalAlignment.Middle, 10)
        {
            Children =
            [
                new Expanded(),
                new Button("Add") { Width = 80, OnTap = _ => OnAddDefaultValue() },
                new Button("Remove") { Width = 80 },
                new Button("Close") { Width = 80, OnTap = _ => Close(DialogResult.OK) }
            ]
        }
    };

    private void OnAddDefaultValue()
    {
        _dgController.Add(new DefaultValueWrapper(new CreateRowParameter.FieldDefaultValue()));
    }

    protected override ValueTask<bool> OnClosing(string result)
    {
        //重新设置CreateRowParameter的默认值
        _createRowParameter.DefaultValues.Clear();
        var newDefaultValues = _dgController.DataSource!;
        foreach (var item in newDefaultValues)
            item.ParseExpression();
        _createRowParameter.DefaultValues.AddRange(newDefaultValues.Select(t => t.Target));

        return base.OnClosing(result);
    }

    private class DefaultValueWrapper
    {
        public DefaultValueWrapper(CreateRowParameter.FieldDefaultValue defaultValue)
        {
            Target = defaultValue;
            ValueExpression = AppBoxCore.Expression.IsNull(defaultValue.DefaultValue)
                ? string.Empty
                : defaultValue.DefaultValue!.ToString();
        }

        public readonly CreateRowParameter.FieldDefaultValue Target;

        public string ValueExpression { get; set; }

        public string TargetStateName
        {
            get => Target.TargetStateName;
            set => Target.TargetStateName = value;
        }

        public void ParseExpression()
        {
            var code = $"using System;static class E{{static object? M(){{return {ValueExpression};}}}}";
            try
            {
                var exp = ExpressionParser.ParseCode(code);
                Target.DefaultValue = exp;
            }
            catch (Exception)
            {
                Target.DefaultValue = null;
                Notification.Warn($"无法解析表达式: {ValueExpression}");
            }
        }
    }
}