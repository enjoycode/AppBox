using System.Threading.Tasks;
using PixUI;

namespace AppBoxDesign
{
    internal interface IDesigner
    {
        Task SaveAsync();

        Task RefreshAsync();
    }

    [TSInterfaceOf]
    internal interface IModelDesigner : IDesigner
    {
        ModelNodeVO ModelNode { get; }

        /// <summary>
        /// 获取大纲视图
        /// </summary>
        Widget? GetOutlinePad();
    }
}