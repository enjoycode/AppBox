using System;
using System.Data.Common;
using Npgsql;

namespace AppBoxStore;

public sealed partial class PgSqlStore : SqlStore
{
    public PgSqlStore(string settings)
    {
        if (settings.StartsWith('{'))
        {
            throw new NotImplementedException();
            // //根据设置创建ConnectionString
            // var s = Newtonsoft.Json.JsonConvert.DeserializeObject<Settings>(settings);
            // _connectionString = $"Server={s.Host};Port={s.Port};Database={s.Database};Userid={s.User};Password={s.Password};Enlist=true;Pooling=true;MinPoolSize=1;MaxPoolSize=200;";
        }
        else
        {
            _connectionString = settings;
        }
    }

    private readonly string _connectionString;

    public override string NameEscaper => "\"";
    public override string ParameterPrefix => "@";
    public override string BlobType => "bytea";
    public override bool IsAtomicUpsertSupported => true;
    public override bool UseReaderForOutput => true;

    public override DbConnection MakeConnection() => new NpgsqlConnection(_connectionString);

    public override DbCommand MakeCommand() => new NpgsqlCommand();
}