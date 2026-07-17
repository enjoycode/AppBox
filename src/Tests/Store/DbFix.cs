using System;
using System.Buffers.Binary;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;
using AppBoxStore.Entities;
using NUnit.Framework;
using PixUI;
using Path = System.IO.Path;

namespace Tests.Store;

public class DbFix
{
    static DbFix()
    {
        ServerRuntimeHelper.MockUserSession();
    }

    // 临时用于修复一些错误的模型数据

    // [Test]
    // public async Task AddWorkflowInstanceVersion()
    // {
    //     var model = (EntityModel)await MetaStore.Provider.LoadModelAsync(WFInstance.MODELID);
    //     var version = new EntityFieldMember(model, nameof(WFInstance.ModelVersion), EntityFieldType.Int, false);
    //     model.AddSysMember(version, WFInstance.VERSION_ID);
    //
    //     var txn = await SqlStore.Default.BeginTransactionAsync();
    //     await MetaStore.Provider.UpdateModelAsync(model, txn);
    //     await txn.CommitAsync();
    // }

    // [Test]
    // public async Task FixWorkflowRuntimeEntity()
    // {
    //     var txn = await SqlStore.Default.BeginTransactionAsync();
    //
    //     var app = await MetaStore.Provider.LoadApplicationAsync(Consts.SYS_APP_ID);
    //     var orgUnit = (EntityModel)await MetaStore.Provider.LoadModelAsync(OrgUnit.MODELID);
    //     var wfInstance = StoreInitiator.CreateWorkflowInstanceModel();
    //     var wfTask = StoreInitiator.CreateWorkflowTaskModel();
    //
    //     await MetaStore.Provider.InsertModelAsync(wfInstance, txn);
    //     await MetaStore.Provider.InsertModelAsync(wfTask, txn);
    //
    //     var container = new InitModelContainer(app);
    //     container.AddEntityModel(orgUnit);
    //     container.AddEntityModel(wfInstance);
    //     container.AddEntityModel(wfTask);
    //
    //     await SqlStore.Default.CreateTableAsync(wfInstance, txn, container);
    //     await SqlStore.Default.CreateTableAsync(wfTask, txn, container);
    //
    //     await txn.CommitAsync();
    // }

    // [Test]
    // public async Task FixIsForeignKey()
    // {
    //     var isForeignKeyProperty = typeof(EntityFieldMember).GetProperty(nameof(EntityFieldMember.IsForeignKey))!;
    //     
    //     var enterprise = (EntityModel) await MetaStore.Provider.LoadModelAsync(Enterprise.MODELID);
    //     var member = enterprise.GetMember("ManagerId");
    //     isForeignKeyProperty.SetValue(member, true);
    //     
    //     var workgroup = (EntityModel) await MetaStore.Provider.LoadModelAsync(Workgroup.MODELID);
    //     member = workgroup.GetMember("ManagerId");
    //     isForeignKeyProperty.SetValue(member, true);
    //     
    //     var orgUnit = (EntityModel) await MetaStore.Provider.LoadModelAsync(OrgUnit.MODELID);
    //     member = orgUnit.GetMember("ParentId");
    //     isForeignKeyProperty.SetValue(member, true);
    //     
    //     var txn = await SqlStore.Default.BeginTransactionAsync();
    //     await MetaStore.Provider.UpdateModelAsync(enterprise, txn);
    //     await MetaStore.Provider.UpdateModelAsync(workgroup, txn);
    //     await MetaStore.Provider.UpdateModelAsync(orgUnit, txn);
    //     await txn.CommitAsync();
    // }

    // [Test]
    // public async Task UpdateModel()
    // {
    //     var wfTask = (EntityModel) await MetaStore.Provider.LoadModelAsync(WFTask.MODELID);
    //     var member = wfTask.GetMember(nameof(WFTask.Actor))!;
    //     var fieldInfo = member.GetType().GetField("_allowNull", BindingFlags.Instance | BindingFlags.GetField | BindingFlags.NonPublic);
    //     fieldInfo!.SetValue(member, false);
    //     member = wfTask.GetMember(nameof(WFTask.Instance))!;
    //     fieldInfo.SetValue(member, false);
    //     
    //     var wfInstance = (EntityModel) await MetaStore.Provider.LoadModelAsync(WFInstance.MODELID);
    //     member = wfInstance.GetMember(nameof(WFInstance.Creator));
    //     fieldInfo.SetValue(member, false);
    //
    //     var txn = await SqlStore.Default.BeginTransactionAsync();
    //     await MetaStore.Provider.UpdateModelAsync(wfTask, txn);
    //     await MetaStore.Provider.UpdateModelAsync(wfInstance, txn);
    //     await txn.CommitAsync();
    // }

    // /// <summary>
    // /// 修复改变了主键的存储结构
    // /// </summary>
    // [Test]
    // public async Task UpdatePrimaryKeys()
    // {
    //     var allModels = await MetaStore.Provider.LoadAllModelAsync();
    //     var entityModels = allModels.Where(m => m.ModelType == ModelType.Entity).Cast<EntityModel>();
    //     var txn = await SqlStore.Default.BeginTransactionAsync();
    //     foreach (var model in entityModels)
    //     {
    //         if (model.Name == "楼盘位置")
    //         {
    //             var pkMember = (EntityFieldMember)model.GetMember("名称")!;
    //             var pkTracker = new FieldTrackerMember(model, "Original名称", pkMember.MemberId);
    //             model.AddMember(pkTracker);
    //
    //             var oldPKField = model.SqlStoreOptions!.PrimaryKeys[0];
    //             var newPKField = new PrimaryKeyField(oldPKField.MemberId, true, oldPKField.OrderByDesc);
    //             newPKField.TrackerMemberId = pkTracker.MemberId;
    //             model.SqlStoreOptions.SetPrimaryKeys(new[] { newPKField });
    //         }
    //
    //         await MetaStore.Provider.UpdateModelAsync(model, txn, null);
    //     }
    //
    //     await txn.CommitAsync();
    // }

    // [Test]
    // public async Task AfterUpdatePrimaryKeys()
    // {
    //     var allModels = await MetaStore.Provider.LoadAllModelAsync();
    //     var entityModels = allModels.Where(m => m.ModelType == ModelType.Entity).Cast<EntityModel>();
    //     foreach (var model in entityModels)
    //     {
    //         Console.WriteLine(model.Name);
    //         var options = model.SqlStoreOptions!;
    //         if (model.Name == "楼盘位置")
    //         {
    //             Assert.True(options.PrimaryKeys[0].AllowChange);
    //             Assert.True(options.PrimaryKeys[0].TrackerMemberId != 0);
    //         }
    //         else
    //         {
    //             if (options.HasPrimaryKeys)
    //             {
    //                 Assert.True(options.PrimaryKeys[0].AllowChange == false);
    //                 Assert.True(options.PrimaryKeys[0].TrackerMemberId == 0);
    //             }
    //         }
    //     }
    // }

    // [Test]
    // public async Task RemoveCharsCountForMetaCode()
    // {
    //     var names = await MetaStore.Provider.LoadMetaNamesAsync(MetaType.META_CODE, null);
    //     var db = SqlStore.Default;
    //     var conn = db.MakeConnection();
    //     await conn.OpenAsync();
    //     var txn = await conn.BeginTransactionAsync();
    //     foreach (var name in names)
    //     {
    //         using var ms = new  MemoryStream();
    //         await MetaStore.Provider.LoadMetaDataAsync(ms, MetaType.META_CODE, name);
    //         var data = ms.GetBuffer().AsSpan(4, (int)ms.Length - 4).ToArray();
    //         ModelId id = name;
    //         await MetaStore.Provider.UpsertModelCodeAsync(id, data, txn);
    //     }
    //     await txn.CommitAsync();
    // }

    // [Test]
    // public async Task ReadBackup()
    // {
    //     DesignTypeSerializer.Register();
    //     const string file = "/Users/rick/Desktop/sys-2.apk";
    //     await using var fileStream = File.OpenRead(file);
    //     await using var zipInputStream = new DeflateStream(fileStream, CompressionMode.Decompress, true);
    //     var reader = new SystemReadStream(zipInputStream);
    //
    //     var appPkg = new OldAppPackage(new ApplicationModel());
    //     Dictionary<string, string>? extLibs = null;
    //     Dictionary<long, string> codes = null!;
    //
    //     try
    //     {
    //         reader.ReadInt(); //保留版本号
    //         appPkg.ReadFrom(reader);
    //         extLibs = await ReadExtLibs(reader);
    //         codes = await ReadCodes(reader);
    //     }
    //     catch (Exception e)
    //     {
    //         Notification.Error($"Read app package failed: {e.Message}");
    //     }
    //     finally
    //     {
    //         DeleteTempFiles(extLibs, codes);
    //     }
    // }

    // private static async ValueTask<Dictionary<string, string>?> ReadExtLibs(SystemReadStream reader)
    // {
    //     var count = reader.ReadVariant();
    //     if (count <= 0)
    //         return null;
    //
    //     var map = new Dictionary<string, string>(); //key=名称, value=临时文件路径
    //     for (var i = 0; i < count; i++)
    //     {
    //         var name = reader.ReadString()!;
    //         var length = reader.ReadInt();
    //
    //         var tempFilePath = Path.GetTempFileName();
    //         await using var tempFileStream =
    //             new FileStream(tempFilePath, FileMode.Create, FileAccess.ReadWrite, FileShare.Read);
    //         await CopyTo(reader.InputStream, tempFileStream, length);
    //
    //         map.Add(name, tempFilePath);
    //     }
    //
    //     return map;
    // }

    // private static async ValueTask<Dictionary<long, string>> ReadCodes(SystemReadStream reader)
    // {
    //     var idBuffer = new byte[8];
    //     var map = new Dictionary<long, string>(); //key=ModelId, value=临时文件路径
    //     while (true)
    //     {
    //         var len = await reader.InputStream.ReadAsync(idBuffer, 0, idBuffer.Length);
    //         if (len <= 0) break;
    //
    //         var size = reader.ReadInt();
    //         var idString = BinaryPrimitives.ReadInt64LittleEndian(idBuffer).ToString();
    //         var tempFilePath = Path.Combine("/Users/rick/Desktop/OldCodes/", $"M{idString}.txt");
    //         await using var tempFileStream =
    //             new FileStream(tempFilePath, FileMode.Create, FileAccess.ReadWrite, FileShare.Read);
    //         await CopyTo(reader.InputStream, tempFileStream, size);
    //
    //         map.Add(BinaryPrimitives.ReadInt64LittleEndian(idBuffer), tempFilePath);
    //     }
    //
    //     return map;
    // }
    //
    // private static async Task CopyTo(Stream input, Stream output, int length)
    // {
    //     const int bufferSize = 2048;
    //     var buffer = new byte[bufferSize];
    //
    //     var bytesRead = 0;
    //     while (bytesRead < length)
    //     {
    //         var len = await input.ReadAsync(buffer, 0, Math.Min(bufferSize, length - bytesRead));
    //         await output.WriteAsync(buffer, 0, len);
    //         bytesRead += len;
    //     }
    // }
    //
    // private static void DeleteTempFiles(Dictionary<string, string>? extLibs, Dictionary<long, string> codes)
    // {
    //     if (extLibs != null)
    //     {
    //         foreach (var file in extLibs.Values)
    //             File.Delete(file);
    //     }
    //
    //     // if (codes != null!)
    //     // {
    //     //     foreach (var file in codes.Values)
    //     //         File.Delete(file);
    //     // }
    // }
}

// internal sealed class OldAppPackage : ModelPackage
// {
//     public OldAppPackage(ApplicationModel app)
//     {
//         Application = app;
//     }
//
//     public ApplicationModel Application { get; private set; }
//
//     /// <summary>
//     /// 用于导入时判断相应的数据库是否存在
//     /// </summary>
//     public List<DataStoreInfo> DataStores { get; private set; } = [];
//
//     #region ====Serialization====
//
//     public override void WriteTo(IOutputStream ws)
//     {
//         Application.WriteTo(ws);
//         ws.WriteVariant(DataStores.Count);
//         foreach (var dataStore in DataStores)
//         {
//             dataStore.WriteTo(ws);
//         }
//
//         ws.WriteFieldEnd(); //reserved
//
//         base.WriteTo(ws);
//     }
//
//     public override void ReadFrom(IInputStream rs)
//     {
//         Application.ReadFrom(rs);
//
//         var count = rs.ReadVariant();
//         for (int i = 0; i < count; i++)
//         {
//             var dataStore = new DataStoreInfo();
//             dataStore.ReadFrom(rs);
//             DataStores.Add(dataStore);
//         }
//
//         rs.ReadFieldId(); //reserved
//
//         base.ReadFrom(rs);
//     }
//
//     #endregion
//
//     public sealed class DataStoreInfo : IBinSerializable
//     {
//         public long Id { get; set; }
//         public string Name { get; set; } = null!;
//
//         public DataStoreKind Kind { get; set; }
//
//         //考虑精确匹配数据库提供者的属性，用于利用某数据库特性的应用(eg:只能用PGSQL)
//         public void WriteTo(IOutputStream ws)
//         {
//             ws.WriteLong(Id);
//             ws.WriteString(Name);
//             ws.WriteByte((byte)Kind);
//             ws.WriteFieldEnd(); //reserved
//         }
//
//         public void ReadFrom(IInputStream rs)
//         {
//             Id = rs.ReadLong();
//             Name = rs.ReadString()!;
//             Kind = (DataStoreKind)rs.ReadByte();
//             rs.ReadFieldId(); //reserved
//         }
//     }
// }