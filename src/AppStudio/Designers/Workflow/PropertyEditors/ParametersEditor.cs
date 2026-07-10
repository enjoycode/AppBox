using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class ParametersEditor : ListEditorBase<WorkflowParameter>
{
    internal static EditorFactory Factory => (ctx, prop) =>
        new(new ParametersEditor(ctx, prop), VerticalAlignment.Top);

    public ParametersEditor(DesignContext context, IDiagramProperty propertyItem) :
        base(propertyItem, p => p.Name)
    {
        _context = context;
    }

    private readonly DesignContext _context;

    protected override async void OnAdd()
    {
        //TODO:检查其他模型的引用, 如视图模型或服务模型启动工作流实例，如有必须先全部签出
        var parameter = new WorkflowParameter();
        var dlg = new ParameterDialog(_context, parameter, true);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        DataSources.Add(parameter);
        RefreshDataSources();
    }

    protected override void OnEdit()
    {
        if (SelectedIndex.Value < 0)
            return;
        var parameter = DataSources[SelectedIndex.Value]; //TODO: should clone one for edit
        var dlg = new ParameterDialog(_context, parameter, false);
        dlg.Show();
    }

    private sealed class ParameterDialog : Dialog
    {
        public ParameterDialog(DesignContext context, WorkflowParameter parameter, bool isNew)
        {
            Title.Value = isNew ? "Add" : "Edit";
            Width = 400;
            Height = 340;

            _context = context;
            _isEdit = !isNew;
            _name = isNew
                ? new RxProxy<string>(() => parameter.Name, v => parameter.Name = v)
                : new RxProxy<string>(() => parameter.Name);
            _remark = new RxProxy<string>(() => parameter.Remark ?? string.Empty, v => parameter.Remark = v);
            _isLocal = new RxProxy<bool>(() => parameter.IsLocalVariable, v => parameter.IsLocalVariable = v);
            _isArray = new RxProxy<bool>(() => parameter.IsArray, v => parameter.IsArray = v);
            _type = new RxProxy<WorkflowParameter.ValueType>(() => parameter.Type, v => parameter.Type = v);
            _isEntity = _type.ToComputed(t => t == WorkflowParameter.ValueType.Entity);
            _targetEntity = new RxProxy<ModelNode?>(() =>
                {
                    if (!_isEntity.Value || !parameter.EntityModelId.HasValue) return null;
                    return _context.DesignTree.FindModelNode(parameter.EntityModelId.Value);
                },
                n =>
                {
                    if (!_isEntity.Value) return;
                    parameter.EntityModelId = n?.Model.Id;
                }
            );
        }

        private readonly DesignContext _context;
        private readonly State<bool> _isEdit;
        private readonly State<bool> _isEntity;
        private readonly State<ModelNode?> _targetEntity;
        private readonly State<string> _name;
        private readonly State<WorkflowParameter.ValueType> _type;
        private readonly State<bool> _isLocal;
        private readonly State<bool> _isArray;
        private readonly State<string> _remark;

        protected override Widget BuildBody() => new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                LabelWidth = 100,
                Children =
                [
                    new FormItem("Name:", BuildNameInput()),
                    new FormItem("Type:", new EnumSelect<WorkflowParameter.ValueType>(_type)),
                    new FormItem("Entity:", new Select<ModelNode>(_targetEntity)
                    {
                        Options = _context.DesignTree.FindNodesByType(ModelType.Entity),
                        LabelGetter = node => $"{node.AppNode.Label}.{node.Label}"
                    }) { Visible = _isEntity },
                    new FormItem("IsLocal:", new Checkbox(_isLocal)),
                    new FormItem("IsArray:", new Checkbox(_isArray)),
                    new FormItem("Remark:", new TextInput(_remark))
                ]
            }
        };

        private Widget BuildNameInput()
        {
            if (_isEdit.Value)
            {
                return new Row
                {
                    Spacing = 5,
                    Children =
                    [
                        new Expanded(new TextInput(_name) { Readonly = _isEdit }),
                        new Button("Rename"),
                    ]
                };
            }

            return new TextInput(_name) { Readonly = _isEdit };
        }
    }
}