using System.Data;
using NUnit.Framework;
using AppBoxStore;
using Npgsql;
using NpgsqlTypes;

namespace Tests.Store;

public sealed class CodeCompressTest
{
    [Test]
    public void CompressTest()
    {
        const string src = "h中😀Hello World, Hello Future!";
        var data = ModelCodeUtil.CompressCode(src);
        var dest = ModelCodeUtil.DecompressCode(data);
        Assert.True(src == dest);
    }

    [Test]
    public async Task StreamingDBTest()
    {
        var memoryStream = new MemoryStream();
        for (var i = 0; i < 1024; i++)
            memoryStream.WriteByte((byte)i);
        memoryStream.Position = 0;

        //写入测试
        await using var conn = new NpgsqlConnection(ServerRuntimeHelper.ConnectionString);
        await conn.OpenAsync();
        await using var cmd1 = new NpgsqlCommand("INSERT INTO demostream (id, data) VALUES (@id, @data)", conn);
        cmd1.Parameters.Add("@id", NpgsqlDbType.Integer).Value = 1;
        cmd1.Parameters.Add("@data", NpgsqlDbType.Bytea, -1 /*Size is set to -1 to indicate "MAX"*/)
            .Value = memoryStream;
        await cmd1.ExecuteNonQueryAsync();
        
        //读取测试
        memoryStream.Position = 0;
        await using var cmd2 = new NpgsqlCommand("SELECT data FROM demostream where id=@id", conn);
        cmd2.Parameters.AddWithValue("@id", 1);
        // The reader needs to be executed with the SequentialAccess behavior to enable network streaming.
        // Otherwise ReadAsync will buffer the entire BLOB into memory which can cause scalability issues or even OutOfMemoryExceptions.
        await using var reader = await cmd2.ExecuteReaderAsync(CommandBehavior.SequentialAccess);
        if (await reader.ReadAsync())
        {
            if (await reader.IsDBNullAsync(0))
                throw new Exception();
            await using var dataStream = await reader.GetStreamAsync(0);
            await dataStream.CopyToAsync(memoryStream);
        }
    }
}