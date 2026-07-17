using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Threading.Tasks;
using System.Data.Common;
using AppBoxCore;
using AppBoxStore.Entities;

namespace AppBoxStore;

/// <summary>
/// 存储初始化器，仅用于启动集群第一节点时初始化存储
/// </summary>
[SuppressMessage("ReSharper", "InconsistentNaming")]
internal static class StoreInitiator
{
#if !FUTURE
    internal const ushort PK_MEMBER_ID = 0; //暂为0
#endif

    private const string SysTablePrefix = $"{Consts.SYS}.";

    internal static async Task InitAsync(
#if !FUTURE
        DbTransaction txn
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
        var entityWorkflowFolder = new ModelFolder(entityRootFolder, "Workflow");
        var viewRootFolder = new ModelFolder(app.Id, ModelType.View);
        var viewOrgUnitsFolder = new ModelFolder(viewRootFolder, "OrgUnits");
        // var viewOperationFolder = new ModelFolder(viewRootFolder, "Operations");
        // var viewMetricsFolder = new ModelFolder(viewOperationFolder, "Metrics");
        // var viewClusterFolder = new ModelFolder(viewOperationFolder, "Cluster");

        //新建EntityModel
        var employee = CreateEmployeeModel();
        employee.FolderId = entityOrgUnitsFolder.Id;
        var enterprise = CreateEnterpriseModel();
        enterprise.FolderId = entityOrgUnitsFolder.Id;
        var workgroup = CreateWorkgroupModel();
        workgroup.FolderId = entityOrgUnitsFolder.Id;
        var orgUnit = CreateOrgUnitModel();
        orgUnit.FolderId = entityOrgUnitsFolder.Id;
        var staged = CreateStagedModel();
        staged.FolderId = entityDesignFolder.Id;
        var checkout = CreateCheckoutModel();
        checkout.FolderId = entityDesignFolder.Id;
        var wfInstance = CreateWorkflowInstanceModel();
        wfInstance.FolderId = entityWorkflowFolder.Id;
        var wfTask = CreateWorkflowTaskModel();
        wfTask.FolderId = entityWorkflowFolder.Id;

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

        var itDept = new Workgroup(Guid.NewGuid());
        itDept.Name = "IT Dept";

        //新建默认组织单元
        var entOrgUnit = new OrgUnit { Base = defaultEnterprise };
        var itDeptOrgUnit = new OrgUnit { Base = itDept, ParentId = entOrgUnit.Id };
        var adminOrgUnit = new OrgUnit { Base = admin, ParentId = itDeptOrgUnit.Id };
        var testOrgUnit = new OrgUnit { Base = test, ParentId = itDeptOrgUnit.Id };

        //事务保存
#if FUTURE
        var txn = await Transaction.BeginAsync();
#endif
        await MetaStore.Provider.UpsertFolderAsync(entityRootFolder, txn);
        await MetaStore.Provider.UpsertFolderAsync(viewRootFolder, txn);

        await MetaStore.Provider.InsertModelAsync(employee, txn);
        await MetaStore.Provider.InsertModelAsync(enterprise, txn);
        await MetaStore.Provider.InsertModelAsync(workgroup, txn);
        await MetaStore.Provider.InsertModelAsync(orgUnit, txn);
        await MetaStore.Provider.InsertModelAsync(staged, txn);
        await MetaStore.Provider.InsertModelAsync(checkout, txn);
        await MetaStore.Provider.InsertModelAsync(wfInstance, txn);
        await MetaStore.Provider.InsertModelAsync(wfTask, txn);

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
        ctx.AddEntityModel(employee);
        ctx.AddEntityModel(enterprise);
        ctx.AddEntityModel(workgroup);
        ctx.AddEntityModel(orgUnit);
        ctx.AddEntityModel(staged);
        ctx.AddEntityModel(checkout);

        await SqlStore.Default.CreateTableAsync(employee, txn, ctx);
        await SqlStore.Default.CreateTableAsync(enterprise, txn, ctx);
        await SqlStore.Default.CreateTableAsync(workgroup, txn, ctx);
        await SqlStore.Default.CreateTableAsync(orgUnit, txn, ctx);
        await SqlStore.Default.CreateTableAsync(staged, txn, ctx);
        await SqlStore.Default.CreateTableAsync(checkout, txn, ctx);

        //插入数据前先设置模型缓存，以防止找不到
        var runtime = (IHostRuntimeContext)RuntimeContext.Current;
        runtime.InjectModel(employee);
        runtime.InjectModel(enterprise);
        runtime.InjectModel(workgroup);
        runtime.InjectModel(orgUnit);
        runtime.InjectModel(staged);
        runtime.InjectModel(checkout);

        await SqlStore.Default.InsertAsync(defaultEnterprise, txn);
        await SqlStore.Default.InsertAsync(itDept, txn);
        await SqlStore.Default.InsertAsync(admin, txn);
        await SqlStore.Default.InsertAsync(test, txn);
        await SqlStore.Default.InsertAsync(entOrgUnit, txn);
        await SqlStore.Default.InsertAsync(itDeptOrgUnit, txn);
        await SqlStore.Default.InsertAsync(adminOrgUnit, txn);
        await SqlStore.Default.InsertAsync(testOrgUnit, txn);
#endif

        //添加权限模型在保存OU实例之后
        var adminPermissionId = ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 1, ModelLayer.SYS);
        var adminPermission = new PermissionModel(adminPermissionId, "Admin");
        adminPermission.Comment = "System administrator";
#if FUTURE
        admin_permission.OrgUnits.Add(adminou.Id);
#else
        adminPermission.OrgUnits.Add(adminOrgUnit.Id);
#endif

        var developerPermissionId = ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 2, ModelLayer.SYS);
        var developerPermission = new PermissionModel(developerPermissionId, "Developer");
        developerPermission.Comment = "System developer";
#if FUTURE
        developer_permission.OrgUnits.Add(itdeptou.Id);
#else
        developerPermission.OrgUnits.Add(itDeptOrgUnit.Id);
#endif
        await MetaStore.Provider.InsertModelAsync(adminPermission, txn);
        await MetaStore.Provider.InsertModelAsync(developerPermission, txn);

        //最后保存编译好的HomePage程序集
        await CreateHomePageAssembly(txn);

#if FUTURE
        await txn.CommitAsync();
#endif
    }

    private static EntityModel CreateEmployeeModel()
    {
#if FUTURE
        var employee = new EntityModel(Consts.SYS_EMPLOEE_MODEL_ID, Consts.EMPLOEE, EntityStoreType.StoreWithMvcc);
#else
        var employee = new EntityModel(Employee.MODELID, nameof(Employee));
        employee.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);

        var id = new EntityFieldMember(employee, nameof(Employee.Id), EntityFieldType.Guid, false);
        employee.AddSysMember(id, Employee.ID_ID);
        //add pk
        employee.SqlStoreOptions!.SetPrimaryKeys([new PrimaryKeyField(id.MemberId, false)]);
#endif

        //Add members
        var name = new EntityFieldMember(employee, nameof(Employee.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 20;
#endif
        employee.AddSysMember(name, Employee.NAME_ID);

        var male = new EntityFieldMember(employee, nameof(Employee.Male), EntityFieldType.Bool, false);
        employee.AddSysMember(male, Employee.MALE_ID);

        var birthday = new EntityFieldMember(employee, nameof(Employee.Birthday), EntityFieldType.DateTime, true);
        employee.AddSysMember(birthday, Employee.BIRTHDAY_ID);

        var account = new EntityFieldMember(employee, nameof(Employee.Account), EntityFieldType.String, true);
        employee.AddSysMember(account, Employee.ACCOUNT_ID);

        var password = new EntityFieldMember(employee, nameof(Employee.Password), EntityFieldType.Binary, true);
        employee.AddSysMember(password, Employee.PASSWORD_ID);

        // var orgunits = new EntitySetMember(emploee, "OrgUnits", OrgUnit.MODELID, OrgUnit.BASE_ID);
        // employee.AddSysMember(orgunits, Employee.);

        //Add indexes
#if FUTURE
        var uiAccount = new EntityIndexModel(emploee, "UI_Account", true,
                                                   new FieldWithOrder[] { new FieldWithOrder(Consts.EMPLOEE_ACCOUNT_ID) },
                                                   new ushort[] { Consts.EMPLOEE_PASSWORD_ID });
        emploee.SysStoreOptions.AddSysIndex(emploee, ui_account, Consts.EMPLOEE_UI_ACCOUNT_ID);
#else
        var uiAccount = new SqlIndex(employee, "UI_Account", true,
            [new OrderedField(Employee.ACCOUNT_ID)], [Employee.PASSWORD_ID]);
        employee.SqlStoreOptions.AddIndex(uiAccount);
#endif

        return employee;
    }

    private static EntityModel CreateEnterpriseModel()
    {
#if FUTURE
        var model = new EntityModel(Consts.SYS_ENTERPRISE_MODEL_ID, Consts.ENTERPRISE, EntityStoreType.StoreWithMvcc);
#else
        var model = new EntityModel(Enterprise.MODELID, nameof(Enterprise));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);

        var id = new EntityFieldMember(model, nameof(Enterprise.Id), EntityFieldType.Guid, false);
        model.AddSysMember(id, Enterprise.ID_ID);
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys([new PrimaryKeyField(id.MemberId, false)]);
#endif

        var name = new EntityFieldMember(model, nameof(Enterprise.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 100;
#endif
        model.AddSysMember(name, Enterprise.NAME_ID);

        var address = new EntityFieldMember(model, nameof(Enterprise.Address), EntityFieldType.String, true);
        model.AddSysMember(address, Enterprise.ADDRESS_ID);

        var managerId = new EntityFieldMember(model, nameof(Enterprise.ManagerId), EntityFieldType.Guid, true, true);
        model.AddSysMember(managerId, Enterprise.MANAGERID_ID);
        var manager = new EntityRefMember(model, nameof(Enterprise.Manager), OrgUnit.MODELID, [managerId.MemberId]);
        model.AddSysMember(manager, Enterprise.MANAGER_ID);

        return model;
    }

    private static EntityModel CreateWorkgroupModel()
    {
#if FUTURE
        var model = new EntityModel(Consts.SYS_WORKGROUP_MODEL_ID, Consts.WORKGROUP, EntityStoreType.StoreWithMvcc);
#else
        var model = new EntityModel(Workgroup.MODELID, nameof(Workgroup));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);

        var id = new EntityFieldMember(model, nameof(Workgroup.Id), EntityFieldType.Guid, false, true);
        model.AddSysMember(id, Workgroup.ID_ID);
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys([new PrimaryKeyField(id.MemberId, false)]);
#endif

        var name = new EntityFieldMember(model, nameof(Workgroup.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 50;
#endif
        model.AddSysMember(name, Workgroup.NAME_ID);

        var managerId = new EntityFieldMember(model, nameof(Workgroup.ManagerId), EntityFieldType.Guid, true);
        model.AddSysMember(managerId, Workgroup.MANAGERID_ID);
        var manager = new EntityRefMember(model, nameof(Workgroup.Manager), OrgUnit.MODELID, [managerId.MemberId]);
        model.AddSysMember(manager, Workgroup.MANAGER_ID);

        return model;
    }

    private static EntityModel CreateOrgUnitModel()
    {
        EntityFieldType fkType;
#if FUTURE
        var model = new EntityModel(Consts.SYS_ORGUNIT_MODEL_ID, Consts.ORGUNIT, EntityStoreType.StoreWithMvcc);
        fkType = EntityFieldType.EntityId;
#else
        fkType = EntityFieldType.Guid;
        var model = new EntityModel(OrgUnit.MODELID, nameof(OrgUnit));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);

        var id = new EntityFieldMember(model, nameof(OrgUnit.Id), EntityFieldType.Guid, false);
        model.AddSysMember(id, OrgUnit.ID_ID);
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys([new PrimaryKeyField(id.MemberId, false)]);
#endif

        var name = new EntityFieldMember(model, nameof(OrgUnit.Name), EntityFieldType.String, false);
#if !FUTURE
        name.Length = 100;
#endif
        model.AddSysMember(name, OrgUnit.NAME_ID);

        var baseType = new EntityFieldMember(model, nameof(OrgUnit.BaseType), EntityFieldType.Long, false);
        model.AddSysMember(baseType, OrgUnit.BASETYPE_ID);
        var baseRef = new EntityRefMember(model, nameof(OrgUnit.Base),
            [Enterprise.MODELID, Workgroup.MODELID, Employee.MODELID],
            [id.MemberId], baseType.MemberId, false);
        model.AddSysMember(baseRef, OrgUnit.BASE_ID);

        var parentId = new EntityFieldMember(model, nameof(OrgUnit.ParentId), fkType, true, true);
        model.AddSysMember(parentId, OrgUnit.PARENTID_ID);
        var parent = new EntityRefMember(model, nameof(OrgUnit.Parent), OrgUnit.MODELID, [parentId.MemberId]);
        model.AddSysMember(parent, OrgUnit.PARENT_ID);

        var children = new EntitySetMember(model, nameof(OrgUnit.Children), OrgUnit.MODELID, parent.MemberId);
        model.AddSysMember(children, OrgUnit.CHILDREN_ID);

        return model;
    }

    private static EntityModel CreateStagedModel()
    {
#if FUTURE
        var model = new EntityModel(Consts.SYS_STAGED_MODEL_ID, "StagedModel", EntityStoreType.StoreWithoutMvcc);
#else
        var model = new EntityModel(StagedModel.MODELID, nameof(StagedModel));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);

#endif

        var type = new EntityFieldMember(model, "Type", EntityFieldType.Byte, false);
        model.AddSysMember(type, StagedModel.TYPE_ID);

        var modelId = new EntityFieldMember(model, "Model", EntityFieldType.String, false);
#if !FUTURE
        modelId.Length = 100;
#endif
        model.AddSysMember(modelId, StagedModel.MODEL_ID);

        var devId = new EntityFieldMember(model, "DeveloperId", EntityFieldType.Guid, false);
        model.AddSysMember(devId, StagedModel.DEVELOPER_ID);

        var data = new EntityFieldMember(model, "Data", EntityFieldType.Binary, true);
        model.AddSysMember(data, StagedModel.DATA_ID);

#if !FUTURE
        //add pk
        model.SqlStoreOptions!.SetPrimaryKeys([
            new PrimaryKeyField(devId.MemberId, false),
            new PrimaryKeyField(type.MemberId, false),
            new PrimaryKeyField(modelId.MemberId, false)
        ]);
#endif

        return model;
    }

    private static EntityModel CreateCheckoutModel()
    {
#if FUTURE
        var model = new EntityModel(Consts.SYS_CHECKOUT_MODEL_ID, "Checkout", EntityStoreType.StoreWithoutMvcc);
#else
        var model = new EntityModel(Checkout.MODELID, nameof(Checkout));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);
#endif

        var nodeType = new EntityFieldMember(model, "NodeType", EntityFieldType.Byte, false);
        model.AddSysMember(nodeType, Checkout.NODE_TYPE_ID);

        var targetId = new EntityFieldMember(model, "TargetId", EntityFieldType.String, false);
#if !FUTURE
        targetId.Length = 100;
#endif
        model.AddSysMember(targetId, Checkout.TARGET_ID);

        var devId = new EntityFieldMember(model, "DeveloperId", EntityFieldType.Guid, false);
        model.AddSysMember(devId, Checkout.DEVELOPER_ID);

        var devName = new EntityFieldMember(model, "DeveloperName", EntityFieldType.String, false);
#if !FUTURE
        devName.Length = 100;
#endif
        model.AddSysMember(devName, Checkout.DEVELOPER_NAME_ID);

        var version = new EntityFieldMember(model, "Version", EntityFieldType.Int, false);
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
        var ui_NodeType_TargetId = new SqlIndex(model, "UI_NodeType_TargetId", true,
        [
            new OrderedField(Checkout.NODE_TYPE_ID),
            new OrderedField(Checkout.TARGET_ID)
        ]);
        model.SqlStoreOptions!.AddIndex(ui_NodeType_TargetId);

        //add pk
        model.SqlStoreOptions.SetPrimaryKeys([
            new PrimaryKeyField(devId.MemberId, false),
            new PrimaryKeyField(nodeType.MemberId, false),
            new PrimaryKeyField(targetId.MemberId, false)
        ]);
#endif
        return model;
    }

    private static EntityModel CreateWorkflowInstanceModel()
    {
        var model = new EntityModel(WFInstance.MODELID, nameof(WFInstance));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);

        var id = new EntityFieldMember(model, nameof(WFInstance.Id), EntityFieldType.Guid, false);
        model.AddSysMember(id, Employee.ID_ID);
        //PK
        model.SqlStoreOptions!.SetPrimaryKeys([new PrimaryKeyField(id.MemberId, false)]);

        var title = new EntityFieldMember(model, nameof(WFInstance.Title), EntityFieldType.String, false);
        title.Length = 200;
        model.AddSysMember(title, WFInstance.TITLE_ID);

        var creatorId = new EntityFieldMember(model, nameof(WFInstance.CreatorId), EntityFieldType.Guid, false, true);
        model.AddSysMember(creatorId, WFInstance.CREATOR_ID_ID);
        var creator = new EntityRefMember(model, nameof(WFInstance.Creator), OrgUnit.MODELID, [creatorId.MemberId],
            false);
        model.AddSysMember(creator, WFInstance.CREATOR_ID);

        var createTime = new EntityFieldMember(model, nameof(WFInstance.CreateTime), EntityFieldType.DateTime, false);
        model.AddSysMember(createTime, WFInstance.CREATE_TIME_ID);

        var status = new EntityFieldMember(model, nameof(WFInstance.Status), EntityFieldType.Byte, false);
        model.AddSysMember(status, WFInstance.STATUS_ID);

        var context = new EntityFieldMember(model, nameof(WFInstance.Context), EntityFieldType.Binary, false);
        model.AddSysMember(context, WFInstance.CONTEXT_ID);

        var parameters = new EntityFieldMember(model, nameof(WFInstance.Parameters), EntityFieldType.Binary, true);
        model.AddSysMember(parameters, WFInstance.PARAMETERS_ID);
        
        var version = new EntityFieldMember(model, nameof(WFInstance.ModelVersion), EntityFieldType.Int, false);
        model.AddSysMember(version, WFInstance.VERSION_ID);

        //Indexes
        var ix_CrateTime_CreatorId = new SqlIndex(model, "IX_CreateTime_CreatorId", false,
        [
            new OrderedField(WFInstance.CREATE_TIME_ID, true),
            new OrderedField(WFInstance.CREATOR_ID_ID)
        ]);
        model.SqlStoreOptions.AddIndex(ix_CrateTime_CreatorId);

        return model;
    }

    private static EntityModel CreateWorkflowTaskModel()
    {
        var model = new EntityModel(WFTask.MODELID, nameof(WFTask));
        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, SysTablePrefix);

        var actorId = new EntityFieldMember(model, nameof(WFTask.ActorId), EntityFieldType.Guid, false, true);
        model.AddSysMember(actorId, WFTask.ACTOR_ID_ID);

        var instanceId = new EntityFieldMember(model, nameof(WFTask.InstanceId), EntityFieldType.Guid, false, true);
        model.AddSysMember(instanceId, WFTask.INSTANCE_ID_ID);

        var bookmarkId = new EntityFieldMember(model, nameof(WFTask.BookmarkId), EntityFieldType.Guid, false);
        model.AddSysMember(bookmarkId, WFTask.BOOKMARK_ID_ID);

        //PK
        model.SqlStoreOptions!.SetPrimaryKeys([
            new PrimaryKeyField(actorId.MemberId, false),
            new PrimaryKeyField(instanceId.MemberId, false),
            new PrimaryKeyField(bookmarkId.MemberId, false)
        ]);

        var actor = new EntityRefMember(model, nameof(WFTask.Actor), OrgUnit.MODELID, [actorId.MemberId], false);
        model.AddSysMember(actor, WFTask.ACTOR_ID);

        var instance = new EntityRefMember(model, nameof(WFTask.Instance), WFInstance.MODELID, [instanceId.MemberId],
            false);
        model.AddSysMember(instance, WFTask.INSTANCE_ID);

        var title = new EntityFieldMember(model, nameof(WFTask.Title), EntityFieldType.String, false);
        title.Length = 200;
        model.AddSysMember(title, WFTask.TITLE_ID);

        var createTime = new EntityFieldMember(model, nameof(WFTask.CreateTime), EntityFieldType.DateTime, false);
        model.AddSysMember(createTime, WFTask.CREATE_TIME_ID);

        //Indexes
        var ix_InstanceId_BookmarkId = new SqlIndex(model, "IX_InstanceId_BookmarkId", false,
            [new OrderedField(WFTask.INSTANCE_ID_ID), new OrderedField(WFTask.BOOKMARK_ID_ID)]);
        model.SqlStoreOptions.AddIndex(ix_InstanceId_BookmarkId);

        return model;
    }

    private static async Task CreateServiceModel(string name, int idIndex, Guid? folderId, bool forceFuture,
        DbTransaction txn /*, List<string>? references = null*/)
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

    private static async Task CreateViewModel(string name, int idIndex, Guid? folderId, DbTransaction txn)
    {
        var modelId = ModelId.Make(Consts.SYS_APP_ID, ModelType.View, idIndex, ModelLayer.SYS);
        var model = new ViewModel(modelId, name) { FolderId = folderId };
        await MetaStore.Provider.InsertModelAsync(model, txn);

        var viewCode = Resources.GetString($"Resources.Views.{name}.cs");
        var codeData = ModelCodeUtil.CompressCode(viewCode);
        await MetaStore.Provider.UpsertModelCodeAsync(model.Id, codeData, txn);
    }

    private static async Task CreateHomePageAssembly(DbTransaction txn)
    {
        var asmData = Resources.GetBytes("Resources.Views.HomePage.dll");
        await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.ClientApp, "1", asmData, txn);

        var jsonData = JsonSerializer.SerializeToUtf8Bytes(new[] { "1" });
        await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.ViewAssemblies, "sys.HomePage", jsonData, txn);
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

    public void AddEntityModel(EntityModel model)
    {
        _models.Add(model.Id, model);
    }

    public ApplicationModel GetApplicationModel(int appId)
    {
        Debug.Assert(_sysApp.Id == appId);
        return _sysApp;
    }

    public EntityModel GetEntityModel(ModelId modelId)
    {
        return _models[modelId];
    }
}
#endif