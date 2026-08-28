using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

/// <summary>
/// 动态视图的二进制序列化器
/// </summary>
internal sealed class DynamicBinSerializer : IDynamicSerializer
{
    public DynamicBinSerializer(DesignController controller)
    {
        _controller = controller;
    }
    
    private readonly DesignController _controller;

    public void Write<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
    {
        if (_controller.Background is { ImageData.Length: > 0 })
        {
            writer.WriteFieldId(1);
            writer.WriteBackground(_controller.Background);
        }

        writer.WriteFieldId(2);
        writer.WriteStates(_controller.StatesController.DataSource);

        writer.WriteFieldId(3);
        WriteWidget(ref writer, _controller.RootElement);

        writer.WriteFieldEnd();
    }

    public void Read<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var parent = (SingleChildWidget?)_controller.RootElement.Parent; //null for unit test
        DesignElement? rootElement = null;

        while (true)
        {
            var fieldId = reader.ReadFieldId();
            if (fieldId == 0) break;
            switch (fieldId)
            {
                case 1: _controller.Background = reader.ReadBackground(); break;
                case 2:
                    _controller.StatesController.DataSource =
                        reader.ReadStates(DesignSettings.CreateDynamicStateValue); break;
                case 3: rootElement = (DesignElement)ReadWidget(ref reader, string.Empty); break;
                default: throw SerializationException.ReadUnknownField(nameof(DynamicBinSerializer), fieldId);
            }
        }

        if (rootElement != null)
        {
            parent?.Child = rootElement;
            _controller.RootElement = rootElement;
            parent?.Relayout();
        }

        _controller.Select(_controller.RootElement); // always select root element
    }

    private static void WriteWidget<TWriter>(ref TWriter writer, DesignElement element)
        where TWriter : struct, IOutputStream
    {
        var meta = element.Meta;
        var data = element.Data;
        writer.WriteString(DynamicReader.TYPE_PROPERTY);
        if (meta == null) //element is a placeholder.
        {
            writer.WriteString(string.Empty); //Type Value

            writer.WriteFloat(element.LayoutBounds.Width);
            writer.WriteFloat(element.LayoutBounds.Height);

            writer.WriteEndObject();
            return;
        }

        //Type
        writer.WriteString(meta.Name); //Type Value

        //Properties
        if (data.Properties != null)
        {
            foreach (var property in data.Properties)
            {
                writer.WriteString(property.Name); //Property Name
                writer.WriteDynamicValue(property.Value); //Property Value
            }
        }

        //Events
        if (data.Events is { Count: > 0 })
        {
            writer.WriteString(DynamicReader.EVENT_PROPERTY); //Property Name
            writer.WriteVariant(data.Events.Count);
            foreach (var eventValue in data.Events)
            {
                writer.WriteEventValue(eventValue);
            }
        }

        //Slots
        if (element is { IsContainer: true, Child: not null })
        {
            var children = DesignController.GetAllChildrenElements(element);
            var slots = children.GroupBy(c => c.SlotName);
            foreach (var group in slots)
            {
                var slot = meta.GetSlot(group.Key);
                writer.WriteString(slot.PropertyName); //eg: "Child"
                if (slot.ContainerType == ContainerType.MultiChild)
                {
                    writer.WriteVariant(group.Count());
                    foreach (var childElement in group)
                    {
                        WriteWidget(ref writer, childElement);
                    }
                }
                else
                {
                    WriteWidget(ref writer, group.First());
                }
            }
        }

        writer.WriteEndObject();
    }

    private Widget ReadWidget<TReader>(ref TReader reader, string slotName) where TReader : struct, IInputStream
    {
        Widget result = null!;
        DesignElement element = null!;
        DynamicWidgetMeta meta = null!;

        while (true)
        {
            var propName = reader.ReadString();
            if (string.IsNullOrEmpty(propName)) break;

            if (propName == DynamicReader.TYPE_PROPERTY)
            {
                var type = reader.ReadString();
                if (string.IsNullOrEmpty(type)) //element is a placeholder
                {
                    var width = reader.ReadFloat();
                    var height = reader.ReadFloat();
                    result = element = new DesignElement(_controller, slotName) { Width = width, Height = height };
                    continue;
                }

                meta = DynamicWidgetManager.GetByName(type);
                if (meta.IsReversedWrapElement)
                {
                    result = meta.CreateInstance();
                    element = new DesignElement(_controller, meta, slotName);
                    meta.DefaultSlot.SetChild(result, element);
                }
                else
                {
                    result = element = new DesignElement(_controller, slotName);
                    element.ChangeMeta(meta, false);
                    element.Child = meta.CreateInstance();
                }
            }
            else if (propName == DynamicReader.EVENT_PROPERTY)
            {
                var count = reader.ReadVariant();
                for (var i = 0; i < count; i++)
                {
                    var eventValue = reader.ReadEventValue();
                    element.Data.SetEventValue(eventValue);
                }
            }
            else if (meta.IsSlot(propName, out var childSlot))
            {
                if (childSlot!.ContainerType == ContainerType.MultiChild)
                {
                    var parent = element.Target!;
                    var count = reader.ReadVariant();
                    for (var i = 0; i < count; i++)
                    {
                        var child = ReadWidget(ref reader, childSlot.PropertyName);
                        childSlot.AddChild(parent, child);
                    }
                }
                else if (childSlot.ContainerType == ContainerType.SingleChildReversed)
                {
                    var child = ReadWidget(ref reader, childSlot.PropertyName);
                    element.Child = child;
                }
                else
                {
                    var child = ReadWidget(ref reader, childSlot.PropertyName);
                    childSlot.SetChild(element.Target!, child);
                }
            }
            else
            {
                var prop = new PropertyValue { Name = propName };
                prop.Value = reader.ReadDynamicValue();

                element.Data.AddPropertyValue(prop);
                element.SetPropertyValue(prop);
            }
        }

        return result;
    }
}

internal static class WriteExtensions
{
    extension<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
    {
        public void WriteEndObject() => writer.WriteString(null);

        public void WriteBackground(DynamicBackground background)
        {
            writer.WriteVariant(background.ImageData!.Length);
            writer.WriteBytes(background.ImageData);
        }

        public void WriteStates(IList<DynamicState>? states)
        {
            if (states == null || states.Count == 0)
            {
                writer.WriteVariant(0);
                return;
            }

            writer.WriteVariant(states.Count);
            foreach (var state in states)
            {
                writer.WriteState(state);
            }
        }

        public void WriteState(DynamicState state)
        {
            writer.WriteString(state.Name);
            writer.WriteByte((byte)state.Type);
            writer.WriteBool(state.AllowNull);
            writer.WriteBool(state.Value != null);
            if (state.Value != null)
            {
                if (state.Value is IBinSerializable serializable)
                    serializable.WriteTo(ref writer);
                else
                    throw new SerializationException(SerializationError.NotSupportedClassType,
                        $"{state.Value.GetType().Name} must implement {nameof(IBinSerializable)}");
            }

            writer.WriteFieldEnd(); //保留
        }

        public void WriteDynamicValue(in DynamicValue value)
        {
            writer.WriteByte((byte)value.From);
            writer.Serialize(value.Value);
        }

        public void WriteEventValue(EventValue value)
        {
            writer.WriteString(value.Name);
            writer.WriteString(value.Action == null! ? null : value.Action.ActionName);
            if (value.Action == null!) return;
            if (value.Action is IBinSerializable serializable)
                serializable.WriteTo(ref writer);
            else
                throw new SerializationException(SerializationError.NotSupportedClassType,
                    $"{value.Action.GetType().Name} must implement {nameof(IBinSerializable)}");
        }
    }
}