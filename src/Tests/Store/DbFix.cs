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
}