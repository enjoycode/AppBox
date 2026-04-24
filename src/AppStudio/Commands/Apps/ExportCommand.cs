using System.IO.Compression;
using AppBoxClient;
using AppBoxCore;
using PixUI;
using PixUI.Platform;

namespace AppBoxDesign;

internal sealed class ExportCommand : DesignCommand
{
    public ExportCommand(DesignHub context) : base(context) { }

    public async void Execute()
    {
        var selectedNode = DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode is not { Data: ApplicationNode appNode })
        {
            Notification.Error("Please select a application node for export.");
            return;
        }

        //先写入临时文件
        var tempFile = await LocalFileSystem.CreateTempFile(false);
        try
        {
            await ExportToStream(appNode, tempFile.FileStream);
            tempFile.FileStream.Position = 0;
            //保存至指定
            var outputFileName = $"{appNode.Model.Name}-{DateTime.Now:yyyy-MM-dd}.apk";
            await FileDialog.SaveFileAsync(new SaveFileOptions()
                { FileName = outputFileName, FileStream = tempFile.FileStream, Title = "Export Application" }
            );
            Notification.Success($"Export [{appNode.Model.Name}] success.");
        }
        catch (Exception ex)
        {
            Notification.Error($"Export error: {ex.Message}");
        }
        finally
        {
            await tempFile.Close();
            await LocalFileSystem.DeleteTempFile(tempFile.FilePath);
        }
    }

    /// <summary>
    /// 压缩写入输出流
    /// </summary>
    private async Task ExportToStream(ApplicationNode appNode, Stream outputStream)
    {
        var appPkg = new AppPackage(appNode.Model);
        appPkg.DevModelIdCounter = await Context.MetaStoreService.LoadModelIdCounterAsync(appNode.Model.Id, true);
        appPkg.UsrModelIdCounter = await Context.MetaStoreService.LoadModelIdCounterAsync(appNode.Model.Id, false);

        //1.加入所有模型及文件夹, 排除所有已删除的
        var models = appNode.GetAllModelNodes()
            .Where(n => n.Model.PersistentState != PersistentState.Deleted)
            .ToArray();
        foreach (var modelNode in models)
            appPkg.Models.Add(modelNode.Model);
        var folders = appNode.GetAllRootFolders().Where(f => !f.IsDeleted);
        foreach (var folder in folders)
            appPkg.Folders.Add(folder);

        //2.解析用到的DataStore
        ParseDataStores(appPkg);

        //3.压缩写入
        await using var zipOutStream = new DeflateStream(outputStream, CompressionMode.Compress, true);
        var writer = new SystemWriteStream(zipOutStream);
        //3.1 写入保留版本号
        writer.WriteInt(0);
        //3.2 写入AppPackage
        appPkg.WriteTo(writer);
        //3.3 写入依赖的第三方库
        await ExportExtLibs(appNode.Model.Name, writer);
        //3.4 写入各模型代码
        await ExportModelCodes(models, writer);
    }

    private static async Task ExportExtLibs(string appName, SystemWriteStream writer)
    {
        //TODO:获取所有第三方依赖(包括平台相关的)
        var extLibs = await Channel.Invoke<List<string>>(DesignMethods.GetExtLibrariesFull, appName);
        if (extLibs.Count == 0)
        {
            writer.WriteVariant(0);
            return;
        }

        writer.WriteVariant(extLibs.Count);
        foreach (var libName in extLibs)
        {
            var tempFile = await LocalFileSystem.CreateTempFile(false);
            try
            {
                await Channel.Download(DesignMethods.LoadMetadataReferenceFull, tempFile.FileStream,
                    (int)ModelDependencyType.ServerExtLibrary, libName, appName);
                tempFile.FileStream.Position = 0;
                //写入库名称
                writer.WriteString(libName);
                //写入字节长度
                writer.WriteInt((int)tempFile.FileStream.Length);
                //写入字节
                await tempFile.FileStream.CopyToAsync(writer.OutputStream);
            }
            finally
            {
                await tempFile.Close();
                await LocalFileSystem.DeleteTempFile(tempFile.FilePath);
            }
        }
    }

    private async Task ExportModelCodes(IList<ModelNode> modelNodes, SystemWriteStream writer)
    {
        foreach (var modelNode in modelNodes)
        {
            if (modelNode.ModelType == ModelType.Service ||
                modelNode.Model is ViewModel { ViewType: ViewModelType.PixUI })
            {
                var tempFile = await LocalFileSystem.CreateTempFile(false);
                try
                {
                    await using var streamWriter = new StreamWriter(tempFile.FileStream, leaveOpen: true);
                    //1.先将代码写入临时文件
                    var doc = Context.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId)!;
                    var srcText = await doc.GetTextAsync();
                    srcText.Write(streamWriter);

                    await streamWriter.FlushAsync();
                    tempFile.FileStream.Position = 0;

                    //2.开始写入
                    await WriteModelCode(modelNode.Model.Id, tempFile.FileStream, writer);
                }
                finally
                {
                    await tempFile.Close();
                    await LocalFileSystem.DeleteTempFile(tempFile.FilePath);
                }
            }
            else if (modelNode.ModelType == ModelType.Report ||
                     modelNode.ModelType == ModelType.Workflow ||
                     modelNode.Model is ViewModel { ViewType: ViewModelType.PixUIDynamic })
            {
                //暂不考虑本地正在修改的，直接从服务端获取
                var tempFile = await LocalFileSystem.CreateTempFile(false);

                try
                {
                    //1.从服务端下载代码
                    await Context.TypeSystem.DownloadSourceCode(tempFile.FileStream, modelNode);
                    tempFile.FileStream.Position = 0;

                    //2.开始写入
                    await WriteModelCode(modelNode.Model.Id, tempFile.FileStream, writer);
                }
                finally
                {
                    await tempFile.Close();
                    await LocalFileSystem.DeleteTempFile(tempFile.FilePath);
                }
            }
        }
    }

    private static async Task WriteModelCode(ModelId modelId, Stream inputStream, SystemWriteStream writer)
    {
        if (inputStream.Length == 0)
            return;

        //写入模型标识
        writer.WriteLong(modelId);
        //写入代码字节长度
        writer.WriteInt((int)inputStream.Length);
        //写入代码字节
        await inputStream.CopyToAsync(writer.OutputStream);
    }

    private void ParseDataStores(AppPackage appPkg)
    {
        //TODO:处理服务可能用到的存储?
        var stores = appPkg.Models
            .Where(m => m is EntityModel entityModel && entityModel.DataStoreKind != DataStoreKind.None)
            .Cast<EntityModel>()
            .Select(s =>
            {
                if (s.StoreOptions is SqlStoreOptions sqlStore)
                {
                    var storeNode = Context.DesignTree.FindDataStoreNode(sqlStore.StoreModelId)!;
                    return new AppPackage.DataStoreInfo()
                        { Id = sqlStore.StoreModelId, Kind = sqlStore.Kind, Name = storeNode.Model.Name };
                }

                throw new NotImplementedException();
            })
            .DistinctBy(s => s.Id);
        appPkg.DataStores.AddRange(stores);
    }
}