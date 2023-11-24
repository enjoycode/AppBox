using System;
using System.Linq;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;
using NUnit.Framework;

namespace Tests.Store;

public class DbFix
{
    static DbFix()
    {
        TestHelper.TryInitDefaultStore();
    }

    // 临时用于修复一些错误的模型数据
    // [Test]
    // public async Task UpdateModel()
    // {
    //     var model = await MetaStore.Provider.LoadModelAsync(8012673906332663824L);
    //     var entityModel = (EntityModel)model;
    //     var member = entityModel.GetMember("Base")!;
    //     var fieldInfo = member.GetType().GetField("_allowNull", BindingFlags.Instance | BindingFlags.GetField | BindingFlags.NonPublic);
    //     fieldInfo!.SetValue(member, false);
    //
    //     var txn = await SqlStore.Default.BeginTransactionAsync();
    //     await MetaStore.Provider.UpdateModelAsync(model, txn, null);
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
    //             var pkMember = (EntityFieldModel)model.GetMember("名称")!;
    //             var pkTracker = new FieldTrackerModel(model, "Original名称", pkMember.MemberId);
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
}