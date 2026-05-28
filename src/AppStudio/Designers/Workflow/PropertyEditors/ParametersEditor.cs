using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class ParametersEditor : ListEditorBase<WorkflowParameter>
{
    internal static EditorFactory Factory => (_, prop) =>
        new(new ParametersEditor(prop), VerticalAlignment.Top);

    public ParametersEditor(IDiagramProperty propertyItem) :
        base(propertyItem, p => p.Name) { }

    protected override async void OnAdd()
    {
        var parameter = new WorkflowParameter();
        var dlg = new ParameterDialog(parameter, true);
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
        var dlg = new ParameterDialog(parameter, false);
        dlg.Show();
    }
    
    private sealed class ParameterDialog : Dialog
    {
        public ParameterDialog(WorkflowParameter parameter, bool isNew)
        {
            Title.Value = isNew ? "Add" : "Edit";
            Width = 400;
            Height = 300;

            _isEdit = !isNew;
            _name = isNew
                ? new RxProxy<string>(() => parameter.Name, v => parameter.Name = v)
                : new RxProxy<string>(() => parameter.Name);
            _remark = new RxProxy<string>(() => parameter.Remark ?? string.Empty, v => parameter.Remark = v);
            _isLocal = new RxProxy<bool>(() => parameter.IsLocalVariable, v => parameter.IsLocalVariable = v);
            _type = new RxProxy<WorkflowParameter.ValueType>(() => parameter.Type, v => parameter.Type = v);
        }

        private readonly State<bool> _isEdit;
        private readonly State<string> _name;
        private readonly State<WorkflowParameter.ValueType> _type;
        private readonly State<bool> _isLocal;
        private readonly State<string> _remark;

        protected override Widget BuildBody() => new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                LabelWidth = 100,
                Children =
                [
                    new FormItem("Name", new Row
                    {
                        Spacing = 5,
                        Children =
                        [
                            new Expanded(new TextInput(_name) { Readonly = _isEdit }),
                            new IfConditional(_isEdit, () => new Button("Rename"))
                        ]
                    }),
                    new FormItem("Type", new EnumSelect<WorkflowParameter.ValueType>(_type)),
                    new FormItem("IsLocal", new Checkbox(_isLocal)),
                    new FormItem("Remark", new TextInput(_remark))
                ]
            }
        };
    }
}