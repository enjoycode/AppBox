using System;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxDesign;

internal sealed class ValueStateEditDialog : Dialog
{
    public ValueStateEditDialog(DynamicState state)
    {
        Title.Value = "State Settings";
        Width = 500;
        Height = 400;

        _state = state;
        //初始化状态
        _state.Value ??= new DynamicValueState();
        _valuestate = (DynamicValueState)_state.Value;
        _isExpression = new RxProxy<bool>(() => _valuestate.Source == DynamicStateValueSource.Expression,
            v => _valuestate.Source = v ? DynamicStateValueSource.Expression : DynamicStateValueSource.Primitive);
        _allowNull = new RxProxy<bool>(() => _state.AllowNull, v => _state.AllowNull = v);

        _value.Value = _valuestate.Value?.ToString() ?? string.Empty; //TODO: Expression to Code
    }

    private readonly DynamicState _state;
    private readonly DynamicValueState _valuestate;
    private readonly State<bool> _isExpression;
    private readonly State<bool> _allowNull;
    private readonly State<string> _value = string.Empty;

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Form
        {
            LabelWidth = 100,
            Children =
            {
                new("Source:", new Row
                {
                    Children =
                    {
                        new Radio(_isExpression.ToReversed()),
                        new Text("Primitive"),
                        new Radio(_isExpression),
                        new Text("Expression"),
                    }
                }),
                new("AllowNull:", new Checkbox(_allowNull)),
                new("Value:", new TextInput(_value))
            }
        }
    };

    protected override async ValueTask<bool> OnClosing(string result)
    {
        if (result != DialogResult.OK) return false;

        //关闭前转换值或表达式
        if (_valuestate.Source == DynamicStateValueSource.Expression)
        {
            //TODO: 根据状态类型正确处理返回类型
            var code = $"using System;static class E{{static object? M(){{return {_value.Value};}}}}";
            try
            {
                var exp = await Channel.Invoke<Expression>("sys.DesignService.ParseExpression",
                    new object?[] { code });
                _valuestate.Value = exp;
                return false;
            }
            catch (Exception)
            {
                Notification.Warn("无法解析表达式");
                return true;
            }
        }

        // convert string to value
        try
        {
            _valuestate.Value = _state.Type switch
            {
                DynamicStateType.String => _value.Value,
                DynamicStateType.Int => int.Parse(_value.Value),
                DynamicStateType.DateTime => DateTime.Parse(_value.Value),
                DynamicStateType.DataSet => throw new InvalidOperationException(),
                _ => throw new NotImplementedException()
            };
        }
        catch (Exception e)
        {
            Notification.Warn($"无法将文本转换为指定的值: {e.Message}");
            return true;
        }

        return false;
    }
}