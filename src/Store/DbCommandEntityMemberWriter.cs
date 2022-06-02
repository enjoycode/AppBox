using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 用于将实体成员转换为DbCommand的参数
/// </summary>
internal readonly struct DbCommandEntityMemberWriter: IEntityMemberWriter
{
    public DbCommandEntityMemberWriter(DbCommand command)
    {
        _command = command;
    }
    
    private readonly DbCommand _command;

    public void WriteStringMember(short id, string? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{flags}";
        para.Value = value;
        _command.Parameters.Add(para);
    }

    public void WriteIntMember(short id, int? value, int flags)
    {
        var para = _command.CreateParameter();
        para.ParameterName = $"p{flags}";
        para.Value = value;
        _command.Parameters.Add(para);
    }
}