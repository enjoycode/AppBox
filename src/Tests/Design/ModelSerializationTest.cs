using System;
using AppBoxCore;
using AppBoxStore;
using NUnit.Framework;

namespace Tests.Design;

public sealed class ModelSerializationTest
{

    [Test]
    public void ModelFolderTest()
    {
        var entityRootFolder = new ModelFolder(Consts.SYS_APP_ID, ModelType.Entity);
        var entityOrgUnitsFolder = new ModelFolder(entityRootFolder, "OrgUnits");
        var entityDesignFolder = new ModelFolder(entityRootFolder, "Design");

        var srcData = MetaSerializer.SerializeMeta(entityRootFolder);
        Assert.True(srcData.Length == 62);
        var dest = MetaSerializer.DeserializeMeta(srcData, () => new ModelFolder());
        var destData = MetaSerializer.SerializeMeta(dest);
        Assert.True(srcData.AsSpan().SequenceEqual(destData));
    }
}