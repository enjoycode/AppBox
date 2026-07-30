using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

/// <summary>
/// 选择绑定的视图模型
/// </summary>
internal sealed class FormSelectEditor : SingleChildWidget
{
    internal static EditorFactory Factory => (ctx, prop) => new FormSelectEditor(ctx, prop);

    public FormSelectEditor(DesignContext designContext, IDiagramProperty propertyItem)
    {
        var state = new RxProxy<ModelNode?>(
            () =>
            {
                var formName = propertyItem.ValueGetter()?.ToString();
                if (string.IsNullOrEmpty(formName)) return null;

                if (ModelId.TryParse(formName, out var viewModelId))
                    return designContext.DesignTree.FindModelNode(viewModelId);

                Span<Range> ranges = stackalloc Range[2];
                var count = formName.AsSpan().Split(ranges, '.');
                if (count != ranges.Length) return null;
                var appName = formName.AsMemory(ranges[0]);
                var viewName = formName.AsMemory(ranges[1]);

                var appNode = designContext.DesignTree.FindApplicationNodeByName(appName);
                if (appNode == null) return null;
                return designContext.DesignTree.FindModelNodeByName(appNode.Model.Id, ModelType.View, viewName);
            },
            node =>
            {
                if (node == null)
                {
                    propertyItem.ValueSetter!(null);
                    return;
                }

                var viewModel = (ViewModel)node.Model;
                if (viewModel.ViewType == ViewModelType.PixUIDynamic)
                {
                    propertyItem.ValueSetter!(viewModel.Id.ToString());
                    return;
                }

                var formName = $"{node.AppName}.{viewModel.Name}";
                propertyItem.ValueSetter!(formName);
            }
        );

        Child = new Select<ModelNode>(state)
        {
            Options = DesignUtils.GetAllViewModels(designContext),
            LabelGetter = node => $"{node.AppNode.Label}.{node.Label}"
        };
    }
}