using System;
using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class ChangePrimaryKeyTest
{
    [Test]
    public void ChangePKTest()
    {
        var model = new EntityModel(0, "TestModel");
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, null);
        var id = new EntityFieldModel(model, "Id", EntityFieldType.Guid, false);
        var code = new EntityFieldModel(model, "Code", EntityFieldType.String, false);
        var name = new EntityFieldModel(model, "Name", EntityFieldType.String, false);
        model.AddMember(id);
        model.AddMember(code);
        model.AddMember(name);
        //model.AcceptChanges();

        //PK = [Code-Changeable]
        var pk1 = new[] { new PrimaryKeyField(code.MemberId, true) };
        ChangePrimaryKeys.Run(model, pk1);
        var tracker1 = model.GetMember("OriginalCode", false);
        Assert.True(tracker1 is FieldTrackerModel tracker && tracker.TargetMemberId == code.MemberId);
        Assert.True(model.SqlStoreOptions!.PrimaryKeys[0].TrackerMemberId == tracker1!.MemberId);

        //PK = [Id, Code-Changeable]
        var pk2 = new[]
        {
            new PrimaryKeyField(id.MemberId, false),
            new PrimaryKeyField(code.MemberId, true),
        };
        ChangePrimaryKeys.Run(model, pk2);
        var tracker2 = model.GetMember("OriginalCode", false);
        Assert.True(tracker2 is FieldTrackerModel && ReferenceEquals(tracker1, tracker2));

        //PK = [Name-Changeable]
        var pk3 = new[] { new PrimaryKeyField(name.MemberId, true) };
        ChangePrimaryKeys.Run(model, pk3);
        Assert.True(model.GetMember("OriginalCode", false) == null);
        Assert.True(model.GetMember("OriginalName", false) is FieldTrackerModel t && t.TargetMemberId == name.MemberId);

        //PK = [Name]
        var pk4 = new[] { new PrimaryKeyField(name.MemberId, false) };
        ChangePrimaryKeys.Run(model, pk4);
        Assert.True(model.GetMember("OriginalName", false) == null);
    }
}