//using System;
//using System.Collections.Generic;
//using System.Text;
//using System.Threading.Tasks;
//using AppBoxStore.Entities;

//namespace AppBoxStore
//{
//    public class OracleSqlStoreInit
//    {
//        public async Task InitAsync()
//        {
//            var txn = await OracleSqlStore.Default.BeginTransactionAsync();

//            //TODO:判断是否已初始化
//            //新建sys ApplicationModel
//            var app = new ApplicationModel("AppBox", Consts.SYS);
//#if FUTURE
//            await ModelStore.CreateApplicationAsync(app);
//#else
//            await MetaStore.Provider.CreateApplicationAsync(app, txn);
//#endif
//            //新建默认文件夹
//            var entityRootFolder = new ModelFolder(app.Id, ModelType.Entity);
//            var entityOrgUnitsFolder = new ModelFolder(entityRootFolder, "OrgUnits");
//            var entityDesignFolder = new ModelFolder(entityRootFolder, "Design");
//            var viewRootFolder = new ModelFolder(app.Id, ModelType.View);
//            var viewOrgUnitsFolder = new ModelFolder(viewRootFolder, "OrgUnits");
//            var viewOperationFolder = new ModelFolder(viewRootFolder, "Operations");
//            var viewMetricsFolder = new ModelFolder(viewOperationFolder, "Metrics");
//            var viewClusterFolder = new ModelFolder(viewOperationFolder, "Cluster");

//            //新建EntityModel
//            var emploee = CreateEmploeeModel(app);
//            emploee.FolderId = entityOrgUnitsFolder.Id;
//            var enterprise = CreateEnterpriseModel(app);
//            enterprise.FolderId = entityOrgUnitsFolder.Id;
//            var workgroup = CreateWorkgroupModel(app);
//            workgroup.FolderId = entityOrgUnitsFolder.Id;
//            var orgunit = CreateOrgUnitModel(app);
//            orgunit.FolderId = entityOrgUnitsFolder.Id;
//            var staged = CreateStagedModel(app);
//            staged.FolderId = entityDesignFolder.Id;
//            var checkout = CreateCheckoutModel(app);
//            checkout.FolderId = entityDesignFolder.Id;

//            //新建默认组织
//            var defaultEnterprise = new Enterprise(Guid.NewGuid());
//            defaultEnterprise.Name = "Future Studio";

//            //新建默认系统管理员及测试账号
//            var admin = new Employee(Guid.NewGuid());
//            admin.Name = admin.Account = "Admin";
//            admin.Password = RuntimeContext.PasswordHasher!.HashPassword("760wb");
//            admin.Male = true;
//            admin.Birthday = new DateTime(1977, 3, 16);

//            var test = new Employee(Guid.NewGuid());
//            test.Name = test.Account = "Test";
//            test.Password = RuntimeContext.PasswordHasher.HashPassword("la581");
//            test.Male = false;
//            test.Birthday = new DateTime(1979, 1, 2);

//            var itdept = new Workgroup(Guid.NewGuid());
//            itdept.Name = "IT Dept";

//            //新建默认组织单元
//            var entou = new OrgUnit { Base = defaultEnterprise };
//            var itdeptou = new OrgUnit { Base = itdept, ParentId = entou.Id };
//            var adminou = new OrgUnit { Base = admin, ParentId = itdeptou.Id };
//            var testou = new OrgUnit { Base = test, ParentId = itdeptou.Id };
//        }
//    }

//    private static EntityModel CreateEmploeeModel(ApplicationModel app)
//    {
//#if FUTURE
//        var emploee = new EntityModel(Consts.SYS_EMPLOEE_MODEL_ID, Consts.EMPLOEE, EntityStoreType.StoreWithMvcc);
//#else
//        var emploee = new EntityModel(Employee.MODELID, nameof(Employee));
//        emploee.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

//        var id = new EntityFieldModel(emploee, nameof(Employee.Id), EntityFieldType.Guid, false);
//        emploee.AddSysMember(id, Employee.ID_ID);
//        //add pk
//        emploee.SqlStoreOptions!.SetPrimaryKeys(new[] { new FieldWithOrder(id.MemberId) });
//#endif

//        //Add members
//        var name = new EntityFieldModel(emploee, nameof(Employee.Name), EntityFieldType.String, false);
//#if !FUTURE
//        name.Length = 20;
//#endif
//        emploee.AddSysMember(name, Employee.NAME_ID);

//        var male = new EntityFieldModel(emploee, nameof(Employee.Male), EntityFieldType.Bool, false);
//        emploee.AddSysMember(male, Employee.MALE_ID);

//        var birthday = new EntityFieldModel(emploee, nameof(Employee.Birthday),
//            EntityFieldType.DateTime, true);
//        emploee.AddSysMember(birthday, Employee.BIRTHDAY_ID);

//        var account =
//            new EntityFieldModel(emploee, nameof(Employee.Account), EntityFieldType.String, true);
//        emploee.AddSysMember(account, Employee.ACCOUNT_ID);

//        var password =
//            new EntityFieldModel(emploee, nameof(Employee.Password), EntityFieldType.Binary, true);
//        emploee.AddSysMember(password, Employee.PASSWORD_ID);

//        // var orgunits = new EntitySetModel(emploee, "OrgUnits", OrgUnit.MODELID, OrgUnit.BASE_ID);
//        // emploee.AddSysMember(orgunits, Employee.);

//        //Add indexes
//#if FUTURE
//        var ui_account = new EntityIndexModel(emploee, "UI_Account", true,
//                                                   new FieldWithOrder[] { new FieldWithOrder(Consts.EMPLOEE_ACCOUNT_ID) },
//                                                   new ushort[] { Consts.EMPLOEE_PASSWORD_ID });
//        emploee.SysStoreOptions.AddSysIndex(emploee, ui_account, Consts.EMPLOEE_UI_ACCOUNT_ID);
//#else
//        var ui_account = new SqlIndexModel(emploee, "UI_Account", true,
//            new[] { new FieldWithOrder(Employee.ACCOUNT_ID) },
//            new[] { Employee.PASSWORD_ID });
//        emploee.SqlStoreOptions.AddIndex(ui_account);
//#endif

//        return emploee;
//    }

//    private static EntityModel CreateEnterpriseModel(ApplicationModel app)
//    {
//#if FUTURE
//            var model =
// new EntityModel(Consts.SYS_ENTERPRISE_MODEL_ID, Consts.ENTERPRISE, EntityStoreType.StoreWithMvcc);
//#else
//        var model = new EntityModel(Enterprise.MODELID, nameof(Enterprise));
//        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

//        var id = new EntityFieldModel(model, nameof(Enterprise.Id), EntityFieldType.Guid, false);
//        model.AddSysMember(id, Enterprise.ID_ID);
//        //add pk
//        model.SqlStoreOptions!.SetPrimaryKeys(new[] { new FieldWithOrder(id.MemberId) });
//#endif

//        var name = new EntityFieldModel(model, nameof(Enterprise.Name), EntityFieldType.String, false);
//#if !FUTURE
//        name.Length = 100;
//#endif
//        model.AddSysMember(name, Enterprise.NAME_ID);

//        var address =
//            new EntityFieldModel(model, nameof(Enterprise.Address), EntityFieldType.String, true);
//        model.AddSysMember(address, Enterprise.ADDRESS_ID);

//        return model;
//    }

//    private static EntityModel CreateWorkgroupModel(ApplicationModel app)
//    {
//#if FUTURE
//            var model =
// new EntityModel(Consts.SYS_WORKGROUP_MODEL_ID, Consts.WORKGROUP, EntityStoreType.StoreWithMvcc);
//#else
//        var model = new EntityModel(Workgroup.MODELID, nameof(Workgroup));
//        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

//        var id = new EntityFieldModel(model, nameof(Workgroup.Id), EntityFieldType.Guid, false);
//        model.AddSysMember(id, Workgroup.ID_ID);
//        //add pk
//        model.SqlStoreOptions!.SetPrimaryKeys(new[] { new FieldWithOrder(id.MemberId) });
//#endif

//        var name = new EntityFieldModel(model, nameof(Workgroup.Name), EntityFieldType.String, false);
//#if !FUTURE
//        name.Length = 50;
//#endif
//        model.AddSysMember(name, Workgroup.NAME_ID);

//        return model;
//    }

//    private static EntityModel CreateOrgUnitModel(ApplicationModel app)
//    {
//        EntityFieldType fkType;
//#if FUTURE
//            var model =
// new EntityModel(Consts.SYS_ORGUNIT_MODEL_ID, Consts.ORGUNIT, EntityStoreType.StoreWithMvcc);
//            fkType = EntityFieldType.EntityId;
//#else
//        fkType = EntityFieldType.Guid;
//        var model = new EntityModel(OrgUnit.MODELID, nameof(OrgUnit));
//        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

//        var id = new EntityFieldModel(model, nameof(OrgUnit.Id), EntityFieldType.Guid, false);
//        model.AddSysMember(id, OrgUnit.ID_ID);
//        //add pk
//        model.SqlStoreOptions!.SetPrimaryKeys(new[] { new FieldWithOrder(id.MemberId) });
//#endif

//        var name = new EntityFieldModel(model, nameof(OrgUnit.Name), EntityFieldType.String, false);
//#if !FUTURE
//        name.Length = 100;
//#endif
//        model.AddSysMember(name, OrgUnit.NAME_ID);

//        var baseType =
//            new EntityFieldModel(model, nameof(OrgUnit.BaseType), EntityFieldType.Long, false);
//        model.AddSysMember(baseType, OrgUnit.BASETYPE_ID);
//        var Base = new EntityRefModel(model, nameof(OrgUnit.Base),
//            new List<long> { Enterprise.MODELID, Workgroup.MODELID, Employee.MODELID },
//            new[] { id.MemberId }, baseType.MemberId, false);
//        model.AddSysMember(Base, OrgUnit.BASE_ID);

//        var parentId = new EntityFieldModel(model, nameof(OrgUnit.ParentId), fkType, true);
//        model.AddSysMember(parentId, OrgUnit.PARENTID_ID);
//        var parent = new EntityRefModel(model, nameof(OrgUnit.Parent), OrgUnit.MODELID,
//            new[] { parentId.MemberId });
//        model.AddSysMember(parent, OrgUnit.PARENT_ID);

//        var children =
//            new EntitySetModel(model, nameof(OrgUnit.Children), OrgUnit.MODELID, parent.MemberId);
//        model.AddSysMember(children, OrgUnit.CHILDREN_ID);

//        return model;
//    }

//    private static EntityModel CreateStagedModel(ApplicationModel app)
//    {
//#if FUTURE
//            var model =
// new EntityModel(Consts.SYS_STAGED_MODEL_ID, "StagedModel", EntityStoreType.StoreWithoutMvcc);
//#else
//        var model = new EntityModel(StagedModel.MODELID, nameof(StagedModel));
//        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');

//#endif

//        var type = new EntityFieldModel(model, "Type", EntityFieldType.Byte, false);
//        model.AddSysMember(type, StagedModel.TYPE_ID);

//        var modelId = new EntityFieldModel(model, "Model", EntityFieldType.String, false);
//#if !FUTURE
//        modelId.Length = 100;
//#endif
//        model.AddSysMember(modelId, StagedModel.MODEL_ID);

//        var devId = new EntityFieldModel(model, "DeveloperId", EntityFieldType.Guid, false);
//        model.AddSysMember(devId, StagedModel.DEVELOPER_ID);

//        var data = new EntityFieldModel(model, "Data", EntityFieldType.Binary, true);
//        model.AddSysMember(data, StagedModel.DATA_ID);

//#if !FUTURE
//        //add pk
//        model.SqlStoreOptions!.SetPrimaryKeys(new[]
//        {
//            new FieldWithOrder(devId.MemberId),
//            new FieldWithOrder(type.MemberId),
//            new FieldWithOrder(modelId.MemberId)
//        });
//#endif

//        return model;
//    }

//    private static EntityModel CreateCheckoutModel(ApplicationModel app)
//    {
//#if FUTURE
//        var model = new EntityModel(Consts.SYS_CHECKOUT_MODEL_ID, "Checkout", EntityStoreType.StoreWithoutMvcc);
//#else
//        var model = new EntityModel(Checkout.MODELID, nameof(Checkout));
//        model.BindToSqlStore(SqlStore.DefaultSqlStoreId, Consts.SYS + '.');
//#endif

//        var nodeType = new EntityFieldModel(model, "NodeType", EntityFieldType.Byte, false);
//        model.AddSysMember(nodeType, Checkout.NODETYPE_ID);

//        var targetId = new EntityFieldModel(model, "TargetId", EntityFieldType.String, false);
//#if !FUTURE
//        targetId.Length = 100;
//#endif
//        model.AddSysMember(targetId, Checkout.TARGET_ID);

//        var devId = new EntityFieldModel(model, "DeveloperId", EntityFieldType.Guid, false);
//        model.AddSysMember(devId, Checkout.DEVELOPER_ID);

//        var devName = new EntityFieldModel(model, "DeveloperName", EntityFieldType.String, false);
//#if !FUTURE
//        devName.Length = 100;
//#endif
//        model.AddSysMember(devName, Checkout.DEVELOPERNAME_ID);

//        var version = new EntityFieldModel(model, "Version", EntityFieldType.Int, false);
//        model.AddSysMember(version, Checkout.VERSION_ID);

//        //Add indexes
//#if FUTURE
//        var ui_nodeType_targetId = new EntityIndexModel(model, "UI_NodeType_TargetId", true,
//                                                        new FieldWithOrder[]
//        {
//            new FieldWithOrder(Consts.CHECKOUT_NODETYPE_ID),
//            new FieldWithOrder(Consts.CHECKOUT_TARGETID_ID)
//        });
//        model.SysStoreOptions.AddSysIndex(model, ui_nodeType_targetId, Consts.CHECKOUT_UI_NODETYPE_TARGETID_ID);
//#else
//        var ui_nodeType_targetId = new SqlIndexModel(model, "UI_NodeType_TargetId", true,
//            new[]
//            {
//                new FieldWithOrder(Checkout.NODETYPE_ID),
//                new FieldWithOrder(Checkout.TARGET_ID)
//            });
//        model.SqlStoreOptions!.AddIndex(ui_nodeType_targetId);

//        //add pk
//        model.SqlStoreOptions.SetPrimaryKeys(new[]
//        {
//            new FieldWithOrder(devId.MemberId),
//            new FieldWithOrder(nodeType.MemberId),
//            new FieldWithOrder(targetId.MemberId)
//        });
//#endif
//        return model;
//    }
//}
