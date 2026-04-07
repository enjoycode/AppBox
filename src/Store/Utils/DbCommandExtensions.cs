using System.Data;
using System.Data.Common;

namespace AppBoxStore;

public static class DbCommandExtensions
{
    public static void AddParameter(this DbCommand cmd, string name, DbType type, object value)
    {
        var para = cmd.CreateParameter();
        para.ParameterName = name;
        para.DbType = type;
        para.Value = value;
        cmd.Parameters.Add(para);
    }

    public static void AddParameter(this DbCommand cmd, string name, DbType type, int size, object value)
    {
        var para = cmd.CreateParameter();
        para.ParameterName = name;
        para.DbType = type;
        para.Value = value;
        para.Size = size;
        cmd.Parameters.Add(para);
    }
}