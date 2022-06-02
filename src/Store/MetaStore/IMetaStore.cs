using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxStore;

public interface IMetaStore
{
    /// <summary>
    ///  加载单个Model，用于运行时或设计时重新加载
    /// </summary>
    ValueTask<ModelBase> LoadModelAsync(long modelId);
}