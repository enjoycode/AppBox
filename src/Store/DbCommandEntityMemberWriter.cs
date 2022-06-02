using System;
using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 用于将实体成员转换为DbCommand的参数
/// </summary>
internal readonly struct DbCommandEntityMemberWriter : IEntityMemberWriter
{
    public DbCommandEntityMemberWriter(DbCommand command)
    {
        _command = command;
    }

    private readonly DbCommand _command;

    public void WriteStringMember(short id, string? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value;
        _command.Parameters.Add(para);
    }

    public void WriteBoolMember(short id, bool? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value;
        _command.Parameters.Add(para);
    }

    public void WriteIntMember(short id, int? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value;
        _command.Parameters.Add(para);
    }

    public void WriteLongMember(short id, long? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value;
        _command.Parameters.Add(para);
    }

    public void WriteDateTimeMember(short id, DateTime? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value;
        _command.Parameters.Add(para);
    }

    public void WriteGuidMember(short id, Guid? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value;
        _command.Parameters.Add(para);
    }

    public void WriteBinaryMember(short id, byte[]? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{_command.Parameters.Count}";
        para.Value = value;
        _command.Parameters.Add(para);
    }
}