using AppBoxCore;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Text;

namespace AppBoxStore;

internal readonly struct OracleDbCommandParameterWriter : IEntityMemberWriter
{
    public OracleDbCommandParameterWriter(DbCommand command)
    {
        _command = command;
    }

    private readonly DbCommand _command;

    public void WriteStringMember(short id, string? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteBoolMember(short id, bool? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : (value.Value ? 1 : 0);
        _command.Parameters.Add(para);
    }

    public void WriteByteMember(short id, byte? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteIntMember(short id, int? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteLongMember(short id, long? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteDateTimeMember(short id, DateTime? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteGuidMember(short id, Guid? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value.Value.ToByteArray();
        _command.Parameters.Add(para);
    }

    public void WriteBinaryMember(short id, byte[]? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteEntityRefMember(short id, Entity? value, int flags)
        => throw new NotSupportedException(nameof(WriteEntityRefMember));

    public void WriteEntitySetMember<T>(short id, EntitySet<T>? value, int flags) where T : Entity, new()
        => throw new NotSupportedException(nameof(WriteEntitySetMember));
}
