using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore.Entities;

namespace AppBoxStore;

/// <summary>
/// 存储初始化器，仅用于启动集群第一节点时初始化存储
/// </summary>
internal static class StoreInitiator
{
#if !FUTURE
    internal const ushort PK_Member_Id = 0; //暂为0
#endif

    internal static async Task InitAsync(
#if !FUTURE
        System.Data.Common.DbTransaction txn
#endif
    )
    {
        //TODO:判断是否已初始化
        //新建sys ApplicationModel
        var app = new ApplicationModel("AppBox", Consts.SYS);
#if FUTURE
            await ModelStore.CreateApplicationAsync(app);
#else
        await MetaStore.Provider.CreateApplicationAsync(app, txn);
#endif
        //新建默认文件夹
        var entityRootFolder = new ModelFolder(app.Id, ModelType.Entity);
        var entityOrgUnitsFolder = new ModelFolder(entityRootFolder, "OrgUnits");
        var entityDesignFolder = new ModelFolder(entityRootFolder, "Design");
        var viewRootFolder = new ModelFolder(app.Id, ModelType.View);
        var viewOrgUnitsFolder = new ModelFolder(viewRootFolder, "OrgUnits");
        var viewOperationFolder = new ModelFolder(viewRootFolder, "Operations");
        var viewMetricsFolder = new ModelFolder(viewOperationFolder, "Metrics");
        var viewClusterFolder = new ModelFolder(viewOperationFolder, "Cluster");

        //新建EntityModel
        var emploee = CreateEmploeeModel(app);
        emploee.FolderId = entityOrgUnitsFolder.Id;
        var enterprise = CreateEnterpriseModel(app);
        enterprise.FolderId = entityOrgUnitsFolder.Id;
        var workgroup = CreateWorkgroupModel(app);
        workgroup.FolderId = entityOrgUnitsFolder.Id;
        var orgunit = CreateOrgUnitModel(app);
        orgunit.FolderId = entityOrgUnitsFolder.Id;
        var staged = CreateStagedModel(app);
        staged.FolderId = entityDesignFolder.Id;
        var checkout = CreateCheckoutModel(app);
        checkout.FolderId = entityDesignFolder.Id;

        //新建默认组织
        var defaultEnterprise = new Enterprise(Guid.NewGuid());
        defaultEnterprise.Name = "Future Studio";

        //新建默认系统管理员及测试账号
        var admin = new Employee(Guid.NewGuid());
        admin.Name = admin.Account = "Admin";
        admin.Password = RuntimeContext.PasswordHasher!.HashPassword("760wb");
        admin.Male = true;
        admin.Birthday = new DateTime(1977, 3, 16);

        var test = new Employee(Guid.NewGuid());
        test.Name = test.Account = "Test";
        test.Password = RuntimeContext.PasswordHasher.HashPassword("la581");
        test.Male = false;
        test.Birthday = new DateTime(1979, 1, 2);

        var itdept = new Workgroup(Guid.NewGuid());
        itdept.Name = "IT Dept";

        //新建默认组织单元
        var entou = new OrgUnit { Base = defaultEnterprise };
        var itdeptou = new OrgUnit { Base = itdept, ParentId = entou.Id };
        var adminou = new OrgUnit { Base = admin, ParentId = itdeptou.Id };
        var testou = new OrgUnit { Base = test, ParentId = itdeptou.Id };

        //事务保存
#if FUTURE
        var txn = await Transaction.BeginAsync();
#endif
        await MetaStore.Provider.UpsertFolderAsync(entityRootFolder, txn);
        await MetaStore.Provider.UpsertFolderAsync(viewRootFolder, txn);

        await MetaStore.Provider.InsertModelAsync(emploee, txn);
        await MetaStore.Provider.InsertModelAsync(enterprise, txn);
        await MetaStore.Provider.InsertModelAsync(workgroup, txn);
        await MetaStore.Provider.InsertModelAsync(orgunit, txn);
        await MetaStore.Provider.InsertModelAsync(staged, txn);
        await MetaStore.Provider.InsertModelAsync(checkout, txn);

#if FUTURE
        await CreateServiceModel("OrgUnitService", 1, null, true, txn);
#else
        await CreateServiceModel("OrgUnitService", 1, null, false, txn);
#endif
//         await CreateServiceModel("MetricService", 2, null, false, txn,
//             new List<string> { "Newtonsoft.Json", "System.Private.Uri", "System.Net.Http" });

        await CreateViewModel("HomePage", 1, null, txn);
        await CreateViewModel("EnterpriseView", 2, viewOrgUnitsFolder.Id, txn);
        await CreateViewModel("WorkgroupView", 3, viewOrgUnitsFolder.Id, txn);
        await CreateViewModel("EmployeeView", 4, viewOrgUnitsFolder.Id, txn);
        await CreateViewModel("PermissionTreeView", 5, viewOrgUnitsFolder.Id, txn);
        await CreateViewModel("OrgUnitsView", 6, viewOrgUnitsFolder.Id, txn);

//         await CreateViewModel("CpuUsages", 7, viewMetricsFolder.Id, txn);
//         await CreateViewModel("MemUsages", 8, viewMetricsFolder.Id, txn);
//         await CreateViewModel("NetTraffic", 9, viewMetricsFolder.Id, txn);
//         await CreateViewModel("DiskIO", 10, viewMetricsFolder.Id, txn);
//         await CreateViewModel("NodeMetrics", 11, viewMetricsFolder.Id, txn);
//         await CreateViewModel("InvokeMetrics", 12, viewMetricsFolder.Id, txn);
//
//         await CreateViewModel("GaugeCard", 13, viewClusterFolder.Id, txn);
//         await CreateViewModel("NodesListView", 14, viewClusterFolder.Id, txn);
//         await CreateViewModel("PartsListView", 15, viewClusterFolder.Id, txn);
//         await CreateViewModel("ClusterHome", 16, viewClusterFolder.Id, txn);
//
//         await CreateViewModel("OpsLogin", 17, viewOperationFolder.Id, txn, "ops");
//         await CreateViewModel("OpsHome", 18, viewOperationFolder.Id, txn);

        //插入数据前先设置模型缓存，以防止找不到
        var runtime = (IHostRuntimeContext)RuntimeContext.Current;
        runtime.InjectModel(emploee);
        runtime.InjectModel(enterprise);
        runtime.InjectModel(workgroup);
        runtime.InjectModel(orgunit);
        runtime.InjectModel(staged);
        runtime.InjectModel(checkout);

#if FUTURE
        await EntityStore.InsertEntityAsync(defaultEnterprise, txn);
        await EntityStore.InsertEntityAsync(itdept, txn);
        await EntityStore.InsertEntityAsync(admin, txn);
        await EntityStore.InsertEntityAsync(test, txn);
        await EntityStore.InsertEntityAsync(entou, txn);
        await EntityStore.InsertEntityAsync(itdeptou, txn);
        await EntityStore.InsertEntityAsync(adminou, txn);
        await EntityStore.InsertEntityAsync(testou, txn);
#else
        var ctx = new InitModelContainer(app);
        ctx.AddEntityModel(emploee);
        ctx.AddEntityModel(enterprise);
        ctx.AddEntityModel(workgroup);
        ctx.AddEntityModel(orgunit);
        ctx.AddEntityModel(staged);
        ctx.AddEntityModel(checkout);

        await SqlStore.Default.CreateTableAsync(emploee, txn, ctx);
        await SqlStore.Default.CreateTableAsync(enterprise, txn, ctx);
        await SqlStore.Default.CreateTableAsync(workgroup, txn, ctx);
        await SqlStore.Default.CreateTableAsync(orgunit, txn, ctx);
        await SqlStore.Default.CreateTableAsync(staged, txn, ctx);
        await SqlStore.Default.CreateTableAsync(checkout, txn, ctx);

        await SqlStore.Default.InsertAsync(defaultEnterprise, txn);
        await SqlStore.Default.InsertAsync(itdept, txn);
        await SqlStore.Default.InsertAsync(admin, txn);
        await SqlStore.Default.InsertAsync(test, txn);
        await SqlStore.Default.InsertAsync(entou, txn);
        await SqlStore.Default.InsertAsync(itdeptou, txn);
        await SqlStore.Default.InsertAsync(adminou, txn);
        await SqlStore.Default.InsertAsync(testou, txn);
#endif

        //添加权限模型在保存OU实例之后
        var admin_permission =
            new PermissionModel(ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 1, ModelLayer.SYS), "Admin");
        admin_permission.Comment = "System administrator";
#if FUTURE
            admin_permission.OrgUnits.Add(adminou.Id);
#else
        admin_permission.OrgUnits.Add(adminou.Id);
#endif
        var developer_permission =
            new PermissionModel(ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 2, ModelLayer.SYS), "Developer");
        developer_permission.Comment = "System developer";
#if FUTURE
            developer_permission.OrgUnits.Add(itdeptou.Id);
#else
        developer_permission.OrgUnits.Add(itdeptou.Id);
#endif
        await MetaStore.Provider.InsertModelAsync(admin_permission, txn);
        await MetaStore.Provider.InsertModelAsync(developer_permission, txn);

#if FUTURE
            await txn.CommitAsync();
#endif
    }

    private static EntityModel CreateEmploeeModel(ApplicationModel app)
    {
#if FUTURE
        var emploee = new EntityModel(Consts.SYS_EMPLOEE_MODEL_ID, Consts.EMPLOEE, EntityStoreType.StoreWithMvcc);
#else
        var emploee = new EntityModel(Employee.MODELID, nameof(Employee));
        emploee.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

        var id = new EntityFieldModel(emploee, nameof(Employee.Id), EntityFieldType.Guid, false);
        emploee.AddSysMember(id, Employee.ID_ID);
        //add pk
        emploee.SqlStoreOptions!.SetPrimaryKeys(new[] { new PrimaryKeyField(id.MemberId, false) });
#endif

        //Add members
        var name = new EntityFieldModel(emploee, nameof(Employee.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 20;
#endif
        emploee.AddSysMember(name, Employee.NAME_ID);

        var male = new EntityFieldModel(emploee, nameof(Employee.Male), EntityFieldType.Bool, false);
        emploee.AddSysMember(male, Employee.MALE_ID);

        var birthday = new EntityFieldModel(emploee, nameof(Employee.Birthday),
            EntityFieldType.DateTime, true);
        emploee.AddSysMember(birthday, Employee.BIRTHDAY_ID);

        var account =
            new EntityFieldModel(emploee, nameof(Employee.Account), EntityFieldType.String, true);
        emploee.AddSysMember(account, Employee.ACCOUNT_ID);

        var password =
            new EntityFieldModel(emploee, nameof(Employee.Password), EntityFieldType.Binary, true);
        emploee.AddSysMember(password, Employee.PASSWORD_ID);

        // var orgunits = new EntitySetModel(emploee, "OrgUnits", OrgUnit.MODELID, OrgUnit.BASE_ID);
        // emploee.AddSysMember(orgunits, Employee.);

        //Add indexes
#if FUTURE
        var ui_account = new EntityIndexModel(emploee, "UI_Account", true,
                                                   new FieldWithOrder[] { new FieldWithOrder(Consts.EMPLOEE_ACCOUNT_ID) },
                                                   new ushort[] { Consts.EMPLOEE_PASSWORD_ID });
        emploee.SysStoreOptions.AddSysIndex(emploee, ui_account, Consts.EMPLOEE_UI_ACCOUNT_ID);
#else
        var ui_account = new SqlIndexModel(emploee, "UI_Account", true,
            new[] { new OrderedField(Employee.ACCOUNT_ID) },
            new[] { Employee.PASSWORD_ID });
        emploee.SqlStoreOptions.AddIndex(ui_account);
#endif

        return emploee;
    }

    private static EntityModel CreateEnterpriseModel(ApplicationModel app)
    {
#if FUTURE
            var model =
 new EntityModel(Consts.SYS_ENTERPRISE_MODEL_ID, Consts.ENTERPRISE, EntityStoreType.StoreWithMvcc);
#else
        var model = new EntityModel(Enterprise.MODELID, nameof(Enterprise));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

        var id = new EntityFieldModel(model, nameof(Enterprise.Id), EntityFieldType.Guid, false);
        model.AddSysMember(id, Enterprise.ID_ID);
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys(new[] { new PrimaryKeyField(id.MemberId, false) });
#endif

        var name = new EntityFieldModel(model, nameof(Enterprise.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 100;
#endif
        model.AddSysMember(name, Enterprise.NAME_ID);

        var address =
            new EntityFieldModel(model, nameof(Enterprise.Address), EntityFieldType.String, true);
        model.AddSysMember(address, Enterprise.ADDRESS_ID);

        return model;
    }

    private static EntityModel CreateWorkgroupModel(ApplicationModel app)
    {
#if FUTURE
            var model =
 new EntityModel(Consts.SYS_WORKGROUP_MODEL_ID, Consts.WORKGROUP, EntityStoreType.StoreWithMvcc);
#else
        var model = new EntityModel(Workgroup.MODELID, nameof(Workgroup));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

        var id = new EntityFieldModel(model, nameof(Workgroup.Id), EntityFieldType.Guid, false);
        model.AddSysMember(id, Workgroup.ID_ID);
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys(new[] { new PrimaryKeyField(id.MemberId, false) });
#endif

        var name = new EntityFieldModel(model, nameof(Workgroup.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 50;
#endif
        model.AddSysMember(name, Workgroup.NAME_ID);

        return model;
    }

    private static EntityModel CreateOrgUnitModel(ApplicationModel app)
    {
        EntityFieldType fkType;
#if FUTURE
            var model =
 new EntityModel(Consts.SYS_ORGUNIT_MODEL_ID, Consts.ORGUNIT, EntityStoreType.StoreWithMvcc);
            fkType = EntityFieldType.EntityId;
#else
        fkType = EntityFieldType.Guid;
        var model = new EntityModel(OrgUnit.MODELID, nameof(OrgUnit));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

        var id = new EntityFieldModel(model, nameof(OrgUnit.Id), EntityFieldType.Guid, false);
        model.AddSysMember(id, OrgUnit.ID_ID);
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys(new[] { new PrimaryKeyField(id.MemberId, false) });
#endif

        var name = new EntityFieldModel(model, nameof(OrgUnit.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 100;
#endif
        model.AddSysMember(name, OrgUnit.NAME_ID);

        var baseType =
            new EntityFieldModel(model, nameof(OrgUnit.BaseType), EntityFieldType.Long, false);
        model.AddSysMember(baseType, OrgUnit.BASETYPE_ID);
        var Base = new EntityRefModel(model, nameof(OrgUnit.Base),
            new List<long> { Enterprise.MODELID, Workgroup.MODELID, Employee.MODELID },
            new[] { id.MemberId }, baseType.MemberId, false);
        model.AddSysMember(Base, OrgUnit.BASE_ID);

        var parentId = new EntityFieldModel(model, nameof(OrgUnit.ParentId), fkType, true);
        model.AddSysMember(parentId, OrgUnit.PARENTID_ID);
        var parent = new EntityRefModel(model, nameof(OrgUnit.Parent), OrgUnit.MODELID,
            new[] { parentId.MemberId });
        model.AddSysMember(parent, OrgUnit.PARENT_ID);

        var children =
            new EntitySetModel(model, nameof(OrgUnit.Children), OrgUnit.MODELID, parent.MemberId);
        model.AddSysMember(children, OrgUnit.CHILDREN_ID);

        return model;
    }

    private static EntityModel CreateStagedModel(ApplicationModel app)
    {
#if FUTURE
            var model =
 new EntityModel(Consts.SYS_STAGED_MODEL_ID, "StagedModel", EntityStoreType.StoreWithoutMvcc);
#else
        var model = new EntityModel(StagedModel.MODELID, nameof(StagedModel));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

#endif

        var type = new EntityFieldModel(model, "Type", EntityFieldType.Byte, false);
        model.AddSysMember(type, StagedModel.TYPE_ID);

        var modelId = new EntityFieldModel(model, "Model", EntityFieldType.String, false);
#if !FUTURE
        modelId.Length = 100;
#endif
        model.AddSysMember(modelId, StagedModel.MODEL_ID);

        var devId = new EntityFieldModel(model, "DeveloperId", EntityFieldType.Guid, false);
        model.AddSysMember(devId, StagedModel.DEVELOPER_ID);

        var data = new EntityFieldModel(model, "Data", EntityFieldType.Binary, true);
        model.AddSysMember(data, StagedModel.DATA_ID);

#if !FUTURE
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys(new[]
        {
            new PrimaryKeyField(devId.MemberId, false),
            new PrimaryKeyField(type.MemberId, false),
            new PrimaryKeyField(modelId.MemberId, false)
        });
#endif

        return model;
    }

    private static EntityModel CreateCheckoutModel(ApplicationModel app)
    {
#if FUTURE
        var model = new EntityModel(Consts.SYS_CHECKOUT_MODEL_ID, "Checkout", EntityStoreType.StoreWithoutMvcc);
#else
        var model = new EntityModel(Checkout.MODELID, nameof(Checkout));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');
#endif

        var nodeType = new EntityFieldModel(model, "NodeType", EntityFieldType.Byte, false);
        model.AddSysMember(nodeType, Checkout.NODETYPE_ID);

        var targetId = new EntityFieldModel(model, "TargetId", EntityFieldType.String, false);
#if !FUTURE
        targetId.Length = 100;
#endif
        model.AddSysMember(targetId, Checkout.TARGET_ID);

        var devId = new EntityFieldModel(model, "DeveloperId", EntityFieldType.Guid, false);
        model.AddSysMember(devId, Checkout.DEVELOPER_ID);

        var devName = new EntityFieldModel(model, "DeveloperName", EntityFieldType.String, false);
#if !FUTURE
        devName.Length = 100;
#endif
        model.AddSysMember(devName, Checkout.DEVELOPERNAME_ID);

        var version = new EntityFieldModel(model, "Version", EntityFieldType.Int, false);
        model.AddSysMember(version, Checkout.VERSION_ID);

        //Add indexes
#if FUTURE
        var ui_nodeType_targetId = new EntityIndexModel(model, "UI_NodeType_TargetId", true,
                                                        new FieldWithOrder[]
        {
            new FieldWithOrder(Consts.CHECKOUT_NODETYPE_ID),
            new FieldWithOrder(Consts.CHECKOUT_TARGETID_ID)
        });
        model.SysStoreOptions.AddSysIndex(model, ui_nodeType_targetId, Consts.CHECKOUT_UI_NODETYPE_TARGETID_ID);
#else
        var ui_nodeType_targetId = new SqlIndexModel(model, "UI_NodeType_TargetId", true,
            new[]
            {
                new OrderedField(Checkout.NODETYPE_ID),
                new OrderedField(Checkout.TARGET_ID)
            });
        model.SqlStoreOptions!.AddIndex(ui_nodeType_targetId);

        //add pk
        model.SqlStoreOptions.SetPrimaryKeys(new[]
        {
            new PrimaryKeyField(devId.MemberId, false),
            new PrimaryKeyField(nodeType.MemberId, false),
            new PrimaryKeyField(targetId.MemberId, false)
        });
#endif
        return model;
    }

    private static async Task CreateServiceModel(string name, int idIndex, Guid? folderId, bool forceFuture,
#if FUTURE
        Transaction txn,
#else
        System.Data.Common.DbTransaction txn,
#endif
        List<string>? references = null)
    {
        var modelId = ModelId.Make(Consts.SYS_APP_ID, ModelType.Service, idIndex, ModelLayer.SYS);
        var model = new ServiceModel(modelId, name) { FolderId = folderId };
        // if (references != null) //TODO:
        //     model.References.AddRange(references);
        await MetaStore.Provider.InsertModelAsync(model, txn);

        var codeRes = forceFuture
            ? $"Resources.Services.{name}_Future.cs"
            : $"Resources.Services.{name}.cs";
        var asmRes = forceFuture
            ? $"Resources.Services.{name}_Future.dll"
            : $"Resources.Services.{name}.dll";

        var serviceCode = Resources.GetString(codeRes);
        var codeData = ModelCodeUtil.CompressCode(serviceCode);
        await MetaStore.Provider.UpsertModelCodeAsync(model.Id, codeData, txn);

        var asmData = Resources.GetBytes(asmRes);
        await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.Service, $"sys.{name}", asmData, txn);
    }

    private static async Task CreateViewModel(string name, int idIndex, Guid? folderId,
#if FUTURE
        Transaction txn
#else
        System.Data.Common.DbTransaction txn
#endif
    )
    {
        var modelId = ModelId.Make(Consts.SYS_APP_ID, ModelType.View, idIndex, ModelLayer.SYS);
        var model = new ViewModel(modelId, name) { FolderId = folderId };
        await MetaStore.Provider.InsertModelAsync(model, txn);

        var viewCode = Resources.GetString($"Resources.Views.{name}.cs");
        var codeData = ModelCodeUtil.CompressCode(viewCode);
        await MetaStore.Provider.UpsertModelCodeAsync(model.Id, codeData, txn);
    }
}

#if !FUTURE
/// <summary>
/// 仅用于初始化默认存储
/// </summary>
internal sealed class InitModelContainer : IModelContainer
{
    private readonly ApplicationModel _sysApp;
    private readonly Dictionary<long, EntityModel> _models;

    public InitModelContainer(ApplicationModel app)
    {
        _sysApp = app;
        _models = new Dictionary<long, EntityModel>(8);
    }

    internal void AddEntityModel(EntityModel model)
    {
        _models.Add(model.Id, model);
    }

    public ApplicationModel GetApplicationModel(int appId)
    {
        Debug.Assert(_sysApp.Id == appId);
        return _sysApp;
    }

    public EntityModel GetEntityModel(ModelId modelID)
    {
        return _models[modelID];
    }
}
#endif