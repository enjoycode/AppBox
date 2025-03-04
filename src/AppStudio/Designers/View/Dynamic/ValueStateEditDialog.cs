using System;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;
using AppBoxDesign.CodeGenerator;
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
        _valueState = (DynamicValueState)_state.Value;
        _isExpression = new RxProxy<bool>(() => _valueState.Source == DynamicValueStateSource.Expression,
            v => _valueState.Source = v ? DynamicValueStateSource.Expression : DynamicValueStateSource.Primitive);
        _allowNull = new RxProxy<bool>(() => _state.AllowNull, v => _state.AllowNull = v);

        _value.Value = _valueState.Value?.ToString() ?? string.Empty; //TODO: Expression to Code
    }

    private readonly DynamicState _state;
    private readonly DynamicValueState _valueState;
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

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result != DialogResult.OK) 
            return new ValueTask<bool>(false);

        //关闭前转换值或表达式
        if (_valueState.Source == DynamicValueStateSource.Expression)
        {
            //TODO: 根据状态类型正确处理返回类型
            var code = $"using System;static class E{{static object? M(){{return {_value.Value};}}}}";
            try
            {
                var exp = ExpressionParser.ParseCode(code);
                _valueState.Value = exp;
                return new ValueTask<bool>(false);
            }
            catch (Exception)
            {
                Notification.Warn("无法解析表达式");
                return new ValueTask<bool>(true);
            }
        }

        // convert string to value
        try
        {
            _valueState.Value = _state.Type switch
            {
                DynamicStateType.String => _value.Value,
                DynamicStateType.Int => int.Parse(_value.Value),
                DynamicStateType.DateTime => DateTime.Parse(_value.Value),
                DynamicStateType.DataTable => throw new InvalidOperationException(),
                _ => throw new NotImplementedException()
            };
        }
        catch (Exception e)
        {
            Notification.Warn($"无法将文本转换为指定的值: {e.Message}");
            return new ValueTask<bool>(true);
        }

        return new ValueTask<bool>(false);
    }
}