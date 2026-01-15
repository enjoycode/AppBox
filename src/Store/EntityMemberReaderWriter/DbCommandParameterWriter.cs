using System;
using System.Collections.Generic;
using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 用于将实体成员转换为DbCommand的参数
/// </summary>
internal readonly struct DbCommandParameterWriter : IEntityMemberWriter
{
    public DbCommandParameterWriter(DbCommand command)
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
        para.Value = value == null ? DBNull.Value : value;
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

    public void WriteFloatMember(short id, float? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteDoubleMember(short id, double? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value == null ? DBNull.Value : value;
        _command.Parameters.Add(para);
    }

    public void WriteDecimalMember(short id, decimal? value, int flags)
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
        para.Value = value == null ? DBNull.Value : value;
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