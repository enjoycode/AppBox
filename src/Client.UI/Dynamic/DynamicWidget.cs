using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxClient.Dynamic;
using PixUI.Dynamic;

namespace PixUI;

/// <summary>
/// 解析动态视图模型生成相应的组件
/// </summary>
public sealed class DynamicWidget : DynamicView, IDynamicView
{
    static DynamicWidget()
    {
        DynamicInitiator.TryInit();
    }

    public DynamicWidget(long viewModelId /*, IDictionary<string, object?>? initProps = null*/)
    {
        _viewModelId = viewModelId;
    }

    private readonly long _viewModelId;
    private bool _hasLoaded;
    private List<DynamicState>? _states;

    protected override void OnMounted()
    {
        base.OnMounted();
        if (!_hasLoaded)
        {
            _hasLoaded = true;
            LoadAsync();
        }
    }

    private async void LoadAsync()
    {
        //TODO:考虑缓存加载过的json配置
        var json = await Channel.Invoke<byte[]?>(
            "sys.SystemService.LoadDynamicViewJson", new object?[] { _viewModelId });
        if (json == null || json.Length == 0)
        {
            ReplaceTo(new Text("Can't find dynamic view")); //TODO: ErrorWidget
            return;
        }

        try
        {
            var root = ParseJson(json);
            ReplaceTo(root);
        }
        catch (Exception e)
        {
            ReplaceTo(new Text($"Parse error: {e.Message}"));
        }
    }

    #region ====Parse Json====

    private Widget ParseJson(byte[] json)
    {
        var reader = new Utf8JsonReader(json);
        Widget? root = null;
        while (reader.Read())
        {
            if (reader.TokenType != JsonTokenType.PropertyName) continue;

            var propName = reader.GetString();
            switch (propName)
            {
                case "State":
                    ReadStates(ref reader);
                    break;
                case "Root":
                    root = ReadWidget(ref reader, null, string.Empty);
                    break;
            }
        }

        if (root == null) throw new Exception();
        return root;
    }

    private void ReadStates(ref Utf8JsonReader reader)
    {
        _states = new List<DynamicState>();

        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject) break;
            if (reader.TokenType != JsonTokenType.PropertyName) continue;

            var propName = reader.GetString()!;
            ReadState(ref reader, propName, _states);
        }
    }

    private static void ReadState(ref Utf8JsonReader reader, string name, IList<DynamicState> states)
    {
        reader.Read(); //{
        reader.Read(); //Type prop
        reader.Read();
        var type = Enum.Parse<DynamicStateType>(reader.GetString()!);
        reader.Read(); //Value prop

        if (type == DynamicStateType.DataSet)
        {
            var ds = new DataSetSettings();
            ds.ReadFrom(ref reader);
            var state = new DynamicState() { Name = name, Type = type, Value = ds };
            states.Add(state);
        }
        else
        {
            throw new NotImplementedException();
        }

        reader.Read(); //}
    }

    private Widget ReadWidget(ref Utf8JsonReader reader, DynamicWidgetMeta? parentMeta, string slotName)
    {
        Widget result = null!;
        DynamicWidgetMeta meta = null!;

        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject) break;
            if (reader.TokenType != JsonTokenType.PropertyName) continue;

            var propName = reader.GetString()!;
            if (propName == "Type")
            {
                reader.Read();
                meta = DynamicWidgetManager.GetByName(reader.GetString()!);
                result = meta.CreateInstance();
            }
            else if (propName == "Events")
            {
                throw new NotImplementedException();
            }
            else if (meta.IsSlot(propName, out var childSlot))
            {
                if (childSlot!.ContainerType == ContainerType.MultiChild)
                {
                    ReadWidgetArray(ref reader, meta, result, childSlot);
                }
                else
                {
                    var child = ReadWidget(ref reader, meta, childSlot!.PropertyName);
                    childSlot.SetChild(result, child);
                }
            }
            else
            {
                var propMeta = meta.GetPropertyMeta(propName);
                var propValue = DynamicValue.Read(ref reader, propMeta);
                propMeta.SetRuntimeValue(meta, result, propValue);
            }
        }

        return result;
    }

    private void ReadWidgetArray(ref Utf8JsonReader reader, DynamicWidgetMeta parentMeta, Widget parent,
        ContainerSlot childrenSlot)
    {
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray) break;
            if (reader.TokenType != JsonTokenType.StartObject) continue;

            var child = ReadWidget(ref reader, parentMeta, childrenSlot.PropertyName);
            childrenSlot.AddChild(parent, child);
        }
    }

    #endregion

    ValueTask<object?> IDynamicView.GetDataSet(string name)
    {
        if (_states == null) return new ValueTask<object?>();

        var state = _states.FirstOrDefault(s => s.Name == name);
        if (state == null || state.Type != DynamicStateType.DataSet || state.Value == null)
            return new ValueTask<object?>();

        return ((IDynamicDataSetStateValue)state.Value).GetRuntimeDataSet();
    }
}