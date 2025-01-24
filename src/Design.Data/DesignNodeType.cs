namespace AppBoxDesign;

public enum DesignNodeType : byte
{
    ApplicationRoot = 0,
    DataStoreRootNode = 1,
    DataStoreNode = 2,
    ApplicationNode = 3,
    ModelRootNode = 4,
    FolderNode = 5, //必须大于ModelNode
    ModelNode = 6,
}