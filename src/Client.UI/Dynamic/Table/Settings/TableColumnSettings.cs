using System.ComponentModel;
using System.Runtime.CompilerServices;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public abstract class TableColumnSettings : INotifyPropertyChanged, IBinSerializable
{
    public string Label
    {
        get;
        set => SetField(ref field, value);
    } = string.Empty;

    public string Width
    {
        get;
        set => SetField(ref field, value);
    } = string.Empty;

    public HorizontalAlignment HorizontalAlignment
    {
        get;
        set => SetField(ref field, value);
    }

    public VerticalAlignment VerticalAlignment
    {
        get;
        set => SetField(ref field, value);
    } = VerticalAlignment.Middle;

    protected internal abstract DataGridColumn<DataRow> BuildColumn(DataGridController<DataRow> controller);

    public abstract TableColumnSettings Clone();

    #region ====INotifyPropertyChanged====

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    protected bool SetField<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value)) return false;
        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        if (!string.IsNullOrEmpty(Label))
        {
            ws.WriteFieldId(1);
            ws.WriteString(Label);
        }

        if (!string.IsNullOrEmpty(Width))
        {
            ws.WriteFieldId(2);
            ws.WriteString(Width);
        }

        if (HorizontalAlignment != HorizontalAlignment.Left)
        {
            ws.WriteFieldId(3);
            ws.WriteByte((byte)HorizontalAlignment);
        }

        if (VerticalAlignment != VerticalAlignment.Middle)
        {
            ws.WriteFieldId(4);
            ws.WriteByte((byte)VerticalAlignment);
        }

        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        while (true)
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 1: Label = rs.ReadString()!; break;
                case 2: Width = rs.ReadString()!; break;
                case 3: HorizontalAlignment = (HorizontalAlignment)rs.ReadByte(); break;
                case 4: VerticalAlignment = (VerticalAlignment)rs.ReadByte(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(TableColumnSettings), fieldId);
            }
        }
    }

    #endregion
}