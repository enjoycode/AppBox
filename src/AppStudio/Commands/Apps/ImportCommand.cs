using System.Buffers.Binary;
using System.IO.Compression;
using AppBoxClient;
using AppBoxCore;
using PixUI;
using PixUI.Platform;

namespace AppBoxDesign;

internal sealed class ImportCommand : DesignCommand
{
    public ImportCommand(DesignContext context) : base(context) { }

    public async void Execute()
    {
        var files = await FileDialog.OpenFileAsync(new OpenFileOptions()
        {
            Title = "Import Application",
            MaxFileSize = int.MaxValue,
        });
        if (files.Length == 0)
            return;
        await using var fileStream = files[0].FileStream;
        await using var zipInputStream = new DeflateStream(fileStream, CompressionMode.Decompress, true);
        var reader = new SystemReadStreamWrap(zipInputStream);

        //1.读取应用包内容
        AppPackage appPkg;
        Dictionary<string, LocalFileInfo>? extLibs = null;
        Dictionary<long, LocalFileInfo> codes = null!;
        try
        {
            reader.GetRef().ReadInt(); //保留版本号
            appPkg = ReadAppPackage(reader);
            extLibs = await ReadExtLibs(reader);
            codes = await ReadCodes(reader);
        }
        catch (Exception e)
        {
            await DeleteTempFiles(extLibs, codes);
            Notification.Error($"Read app package failed: {e.Message}");
            return;
        }

        //2.检查
        //2.1检查存储是否存在
        if (!CheckDataStoreExists(appPkg, out var notExists))
        {
            await DeleteTempFiles(extLibs, codes);
            Notification.Error($"Data store: [{notExists!.Name}]-[{notExists.Kind}] not exists");
            return;
        }

        //2.2检查同名App但标识不同
        var existsAppNode = Context.DesignTree.FindApplicationNodeByName(appPkg.Application.Name.AsMemory());
        if (existsAppNode != null && existsAppNode.Model.Id != appPkg.Application.Id)
        {
            await DeleteTempFiles(extLibs, codes);
            Notification.Error($"App exists but id not same, Please rename existing app first.");
            return;
        }

        //3.开始导入
        try
        {
            existsAppNode = Context.DesignTree.FindApplicationNode(appPkg.Application.Id);
            if (existsAppNode == null)
                await ImportApp(appPkg, extLibs, codes);
            else
                await UpdateApp(existsAppNode, appPkg, extLibs, codes);
        }
        catch (Exception e)
        {
            Notification.Error($"Import app error: {e.Message}");
        }
        finally
        {
            await DeleteTempFiles(extLibs, codes);
        }
    }

    private async Task ImportApp(AppPackage appPkg, Dictionary<string, LocalFileInfo>? extLibs,
        Dictionary<long, LocalFileInfo> codes)
    {
        //1.先创建应用
        var appNode = await NewAppCommand.CreateApplication(Context, appPkg.Application);
        if (appPkg.DevModelIdCounter is { Length: > 0 })
            await Context.MetaStoreService.UpsertModelIdCounterAsync(appPkg.Application.Id, true,
                appPkg.DevModelIdCounter);
        if (appPkg.UsrModelIdCounter is { Length: > 0 })
            await Context.MetaStoreService.UpsertModelIdCounterAsync(appPkg.Application.Id, false,
                appPkg.UsrModelIdCounter);

        //2.签出所有根文件夹
        await appNode.CheckoutAllModelRootNodes();
        //3.保存依赖的第三方库
        if (extLibs != null)
        {
            foreach (var kv in extLibs)
            {
                await Context.MetaStoreService.UploadExtLib(kv.Value.FileStream, appPkg.Application.Name, kv.Key);
            }
        }

        //4.导入并加入到设计树
        foreach (var folder in appPkg.Folders)
        {
            folder.Import();
            Context.DesignTree.FindModelRootNode(folder.AppId, folder.TargetModelType)!.LoadFolder(folder);
            await Context.StagedService.SaveFolderAsync(folder); //保存
        }

        var allModelNodes = new List<ModelNode>(appPkg.Models.Count);
        foreach (var model in appPkg.Models)
        {
            model.Import();
            allModelNodes.Add(Context.DesignTree.FindModelRootNode(model.Id.AppId, model.ModelType)!.LoadModel(model));
        }

        //5.创建模型的RoslynDocument
        foreach (var modelNode in allModelNodes)
        {
            Stream? codeStream = null;
            if (codes.TryGetValue(modelNode.Model.Id, out var tempFile))
                codeStream = tempFile.FileStream;
            await modelNode.SaveAsync(codeStream);

            string? srcCode = null;
            if (modelNode.IsCodable && codeStream != null)
            {
                codeStream.Position = 0;
                using var stringReader = new StreamReader(codeStream);
                srcCode = await stringReader.ReadToEndAsync();
            }

            await Context.CreateModelDocumentAsync(modelNode, srcCode);
        }
    }

    private async Task UpdateApp(ApplicationNode appNode, AppPackage appPkg,
        Dictionary<string, LocalFileInfo>? extLibs,
        Dictionary<long, LocalFileInfo> codes)
    {
        //1.先尝试签出所有根文件夹及模型节点，并关闭当前打开的编辑器
        await appNode.CheckoutAllModelRootNodes();
        await appNode.CheckoutAllModelNodes();
        DesignStore.CloseAllDesignerByApp(appPkg.Application.Id);

        //2.开始比较更新
        var oldFolders = appNode.GetAllRootFolders().ToArray();
        var oldModelNodes = appNode.GetAllModelNodes().ToArray();
        var oldModels = oldModelNodes.Select(n => n.Model).ToArray();
        var newFolders = new List<ModelFolder>(oldFolders.Length);
        var newModels = new List<ModelBase>(oldModels.Length);
        //2.1 比较文件夹
        var folderComparer = new FolderComparer();
        var addedFolders = appPkg.Folders.Except(oldFolders, folderComparer);
        foreach (var addedFolder in addedFolders)
        {
            addedFolder.Import();
            newFolders.Add(addedFolder);
        }

        var removedFolders = oldFolders.Except(appPkg.Folders, folderComparer);
        foreach (var removedFolder in removedFolders)
        {
            removedFolder.IsDeleted = true;
            newFolders.Add(removedFolder);
        }

        var otherFolders = oldFolders.Intersect(appPkg.Folders, folderComparer);
        foreach (var folder in otherFolders)
        {
            if (folder.UpdateFrom(appPkg.Folders.Single(t =>
                    t.TargetModelType == folder.TargetModelType && t.Id == folder.Id)))
                newFolders.Add(folder);
        }

        //2.2 比较模型
        var modelComparer = new ModelComparer();
        var addedModels = appPkg.Models.Except(oldModels, modelComparer);
        foreach (var addedModel in addedModels)
        {
            addedModel.Import();
            newModels.Add(addedModel);
        }

        var removedModels = oldModels.Except(appPkg.Models, modelComparer);
        foreach (var removedModel in removedModels)
        {
            if (removedModel.PersistentState != PersistentState.Detached)
            {
                removedModel.Delete();
                newModels.Add(removedModel);
            }

            Context.AddRemovedItem(removedModel);
        }

        var otherModels = oldModels.Intersect(appPkg.Models, modelComparer);
        foreach (var model in otherModels)
        {
            if (model.UpdateFrom(appPkg.Models.Single(t => t.ModelType == model.ModelType && t.Id == model.Id)))
                newModels.Add(model);
        }

        //3.清除旧应用节点开始重新加载
        appNode.ClearForReload();
        DesignStore.ClearAppNodeForReload(appNode);
        foreach (var folder in newFolders)
        {
            if (!folder.IsDeleted)
                Context.DesignTree.FindModelRootNode(folder.AppId, folder.TargetModelType)!.LoadFolder(folder);
            await Context.StagedService.SaveFolderAsync(folder); //保存
        }

        var newModelNodes = new List<ModelNode>(newModels.Count);
        foreach (var model in newModels)
        {
            if (model.PersistentState != PersistentState.Deleted)
            {
                newModelNodes.Add(
                    Context.DesignTree.FindModelRootNode(model.Id.AppId, model.ModelType)!.LoadModel(model));
            }
        }

        //4.开始重新创建RoslynDocument
        //4.1 先移除旧的
        foreach (var modelNode in oldModelNodes)
        {
            if (modelNode.Model.PersistentState == PersistentState.Deleted)
                await modelNode.SaveAsync(null);
            else if (modelNode.Model.PersistentState == PersistentState.Detached)
                await Context.StagedService.DeleteModelAsync(modelNode.Model.Id);
            Context.RemoveAllDocuments(modelNode);
        }

        //4.2 再重新添加
        foreach (var modelNode in newModelNodes)
        {
            Stream? codeStream = null;
            if (codes.TryGetValue(modelNode.Model.Id, out var tempFile))
                codeStream = tempFile.FileStream;
            await modelNode.SaveAsync(codeStream);

            string? srcCode = null;
            if (modelNode.IsCodable && codeStream != null)
            {
                codeStream.Position = 0;
                using var stringReader = new StreamReader(codeStream);
                srcCode = await stringReader.ReadToEndAsync();
            }

            await Context.CreateModelDocumentAsync(modelNode, srcCode);
        }

        //5.保存依赖的第三方库 TODO:比较移除不再依赖的
        if (extLibs != null)
        {
            foreach (var kv in extLibs)
            {
                await Context.MetaStoreService.UploadExtLib(kv.Value.FileStream, appPkg.Application.Name, kv.Key);
            }
        }

        //6.更新标型标识计数器
        if (appPkg.DevModelIdCounter is { Length: > 0 })
            await Context.MetaStoreService.UpsertModelIdCounterAsync(appPkg.Application.Id, true,
                appPkg.DevModelIdCounter);
        if (appPkg.UsrModelIdCounter is { Length: > 0 })
            await Context.MetaStoreService.UpsertModelIdCounterAsync(appPkg.Application.Id, false,
                appPkg.UsrModelIdCounter);
    }

    /// <summary>
    /// 检查依赖的存储是否已存在，不存在需要先建立后再导入
    /// </summary>
    /// <returns>true=所有存储皆存在</returns>
    private bool CheckDataStoreExists(AppPackage appPkg, out AppPackage.DataStoreInfo? notExists)
    {
        var allStoreNodes = Context.DesignTree.GetAllDataStoreNodes();
        //暂根据名称及类型判断
        foreach (var dataStore in appPkg.DataStores)
        {
            if (!allStoreNodes.Any(n => n.Model.Name == dataStore.Name && n.Model.Kind == dataStore.Kind))
            {
                notExists = dataStore;
                return false;
            }
        }

        notExists = null;
        return true;
    }

    private static async ValueTask DeleteTempFiles(Dictionary<string, LocalFileInfo>? extLibs,
        Dictionary<long, LocalFileInfo> codes)
    {
        if (extLibs != null)
        {
            foreach (var file in extLibs.Values)
            {
                await file.Close();
                await LocalFileSystem.DeleteTempFile(file.FilePath);
            }
        }

        if (codes != null!)
        {
            foreach (var file in codes.Values)
            {
                await file.Close();
                await LocalFileSystem.DeleteTempFile(file.FilePath);
            }
        }
    }

    private static AppPackage ReadAppPackage(SystemReadStreamWrap reader)
    {
        var appPkg = new AppPackage(new ApplicationModel());
        appPkg.ReadFrom(ref reader.GetRef());
        return appPkg;
    }

    private static async ValueTask<Dictionary<string, LocalFileInfo>?> ReadExtLibs(SystemReadStreamWrap reader)
    {
        var count = reader.GetRef().ReadVariant();
        if (count <= 0)
            return null;

        var map = new Dictionary<string, LocalFileInfo>(); //key=名称, value=临时文件路径
        for (var i = 0; i < count; i++)
        {
            var name = reader.GetRef().ReadString()!;
            var length = reader.GetRef().ReadInt();

            var tempFile = await LocalFileSystem.CreateTempFile(false);
            await CopyTo(reader.InputStream, tempFile.FileStream, length);
            tempFile.FileStream.Position = 0;
            map.Add(name, tempFile);
        }

        return map;
    }

    private static async ValueTask<Dictionary<long, LocalFileInfo>> ReadCodes(SystemReadStreamWrap reader)
    {
        var idBuffer = new byte[8];
        var map = new Dictionary<long, LocalFileInfo>(); //key=ModelId, value=临时文件路径
        while (true)
        {
            var len = await reader.InputStream.ReadAsync(idBuffer, 0, idBuffer.Length);
            if (len <= 0) break;

            var size = reader.GetRef().ReadInt();
            var tempFile = await LocalFileSystem.CreateTempFile(false);
            await CopyTo(reader.InputStream, tempFile.FileStream, size);
            tempFile.FileStream.Position = 0;

            map.Add(BinaryPrimitives.ReadInt64LittleEndian(idBuffer), tempFile);
        }

        return map;
    }

    private static async Task CopyTo(Stream input, Stream output, int length)
    {
        const int bufferSize = 2048;
        var buffer = new byte[bufferSize];

        var bytesRead = 0;
        while (bytesRead < length)
        {
            var len = await input.ReadAsync(buffer, 0, Math.Min(bufferSize, length - bytesRead));
            await output.WriteAsync(buffer, 0, len);
            bytesRead += len;
        }
    }

    private sealed class FolderComparer : IEqualityComparer<ModelFolder>
    {
        public bool Equals(ModelFolder? x, ModelFolder? y)
        {
            if (ReferenceEquals(x, y)) return true;
            if (x == null || y == null) return false;
            return x.AppId == y.AppId && x.TargetModelType == y.TargetModelType && x.Id == y.Id;
        }

        public int GetHashCode(ModelFolder obj) => obj.Id.GetHashCode() ^ (int)obj.TargetModelType;
    }

    private sealed class ModelComparer : IEqualityComparer<ModelBase>
    {
        public bool Equals(ModelBase? x, ModelBase? y)
        {
            if (ReferenceEquals(x, y)) return true;
            if (x == null || y == null) return false;
            return x.AppId == y.AppId && x.ModelType == y.ModelType && x.Id == y.Id;
        }

        public int GetHashCode(ModelBase obj) => obj.Id.GetHashCode() ^ (int)obj.ModelType;
    }
}