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
        var tempFileStream = LocalFileSystem.CreateTempFile(out var tempFilePath, false);
        try
        {
            await ExportToStream(appNode, tempFileStream);
            tempFileStream.Position = 0;
            //保存至指定
            var outputFileName = $"{appNode.Model.Name}-{DateTime.Now:yyyy-MM-dd}.apk";
            await FileDialog.SaveFileAsync(new SaveFileOptions()
                { FileName = outputFileName, FileStream = tempFileStream, Title = "Export Application" }
            );
        }
        finally
        {
            tempFileStream.Dispose();
            LocalFileSystem.DeleteTempFile(tempFilePath);
        }
    }

    /// <summary>
    /// 压缩写入输出流
    /// </summary>
    private async Task ExportToStream(ApplicationNode appNode, Stream outputStream)
    {
        var appPkg = new AppPackage(appNode.Model);
        //1.加入所有模型及文件夹
        var models = appNode.GetAllModelNodes();
        foreach (var modelNode in models)
            appPkg.Models.Add(modelNode.Model); //TODO: should exclude deleted.
        var folders = appNode.GetAllRootFolders();
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
        //3.3 写入各模型代码
        await ExportModelCodes(models, writer);
    }

    private async Task ExportModelCodes(IList<ModelNode> modelNodes, SystemWriteStream writer)
    {
        foreach (var modelNode in modelNodes)
        {
            if (modelNode.ModelType == ModelType.Service ||
                modelNode.Model is ViewModel { ViewType: ViewModelType.PixUI })
            {
                var tempFileStream = LocalFileSystem.CreateTempFile(out var tempFilePath, false);

                try
                {
                    await using var streamWriter = new StreamWriter(tempFileStream, leaveOpen: true);
                    //1.先将代码写入临时文件
                    var doc = Context.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId)!;
                    var srcText = await doc.GetTextAsync();
                    srcText.Write(streamWriter);

                    await streamWriter.FlushAsync();
                    tempFileStream.Position = 0;

                    //2.开始写入
                    await WriteModelCode(modelNode.Model.Id, tempFileStream, writer);
                }
                finally
                {
                    tempFileStream.Close();
                    LocalFileSystem.DeleteTempFile(tempFilePath);
                }
            }
            else if (modelNode.ModelType == ModelType.Report ||
                     modelNode.ModelType == ModelType.Workflow ||
                     modelNode.Model is ViewModel { ViewType: ViewModelType.PixUIDynamic })
            {
                //暂不考虑本地正在修改的，直接从服务端获取
                var tempFileStream = LocalFileSystem.CreateTempFile(out var tempFilePath, false);

                try
                {
                    //1.从服务端下载代码
                    await Context.TypeSystem.DownloadSourceCode(tempFileStream, modelNode);
                    tempFileStream.Position = 0;

                    //2.开始写入
                    await WriteModelCode(modelNode.Model.Id, tempFileStream, writer);
                }
                finally
                {
                    tempFileStream.Close();
                    LocalFileSystem.DeleteTempFile(tempFilePath);
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
            .Select(m => m.StoreOptions!)
            .Distinct()
            .Select(s =>
            {
                if (s is SqlStoreOptions sqlStore)
                {
                    var storeNode = Context.DesignTree.FindDataStoreNode(sqlStore.StoreModelId)!;
                    return new AppPackage.DataStoreInfo()
                        { Id = sqlStore.StoreModelId, Kind = sqlStore.Kind, Name = storeNode.Model.Name };
                }

                throw new NotImplementedException();
            });
        appPkg.DataStores.AddRange(stores);
    }
}