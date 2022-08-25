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
    }
}