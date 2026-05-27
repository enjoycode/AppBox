using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class ParameterEditor : SingleChildWidget
{
    internal static EditorFactory Factory => (_, prop) =>
        new(new ParameterEditor(prop), VerticalAlignment.Top);

    public ParameterEditor(IDiagramProperty propertyItem)
    {
        _propertyItem = propertyItem;
        _listController = new ListViewController<WorkflowParameter>();
        _dataSources = (IList<WorkflowParameter>)_propertyItem.ValueGetter()!;

        Height = 100;

        Child = new Column()
        {
            Spacing = 5,
            Alignment = HorizontalAlignment.Left,
            Children =
            [
                new ButtonGroup()
                {
                    Height = CmdBarHeight,
                    Children =
                    [
                        new Button(icon: MaterialIcons.Add) { Width = _buttonWidth, OnTap = _ => OnAdd() },
                        new Button(icon: MaterialIcons.Edit) { Width = _buttonWidth, OnTap = _ => OnEdit() },
                        new Button(icon: MaterialIcons.Remove) { Width = _buttonWidth, OnTap = _ => OnRemove() }
                    ]
                },

                new ListView<WorkflowParameter>(
                    (item, index) => new SelectableItem(index, _selectedIndex)
                    {
                        Child = new Text(item.Name)
                    },
                    _dataSources, _listController
                )
            ]
        };
    }

    private const float CmdBarHeight = 20;
    private readonly State<float> _buttonWidth = 20;
    private readonly IDiagramProperty _propertyItem;
    private readonly IList<WorkflowParameter> _dataSources;
    private readonly ListViewController<WorkflowParameter> _listController;
    private readonly State<int> _selectedIndex = -1;

    private async void OnAdd()
    {
        var parameter = new WorkflowParameter();
        var dlg = new ParameterDialog(parameter, true);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _dataSources.Add(parameter);
        RefreshDataSources();
    }

    private void OnEdit()
    {
        if (_selectedIndex.Value < 0)
            return;
        var parameter = _dataSources[_selectedIndex.Value]; //TODO: should clone one for edit
        var dlg = new ParameterDialog(parameter, false);
        dlg.Show();
    }

    private void OnRemove()
    {
        if (_selectedIndex.Value < 0)
            return;

        _dataSources.RemoveAt(_selectedIndex.Value);
        RefreshDataSources();
    }

    private void RefreshDataSources()
    {
        _listController.DataSource = _dataSources; //TODO: use Refresh()
    }

    public override void OnPaint(ICanvas canvas, IDirtyArea? area = null)
    {
        // draw border
        var paint = Paint.Shared(Colors.Silver, PaintStyle.Stroke);
        canvas.DrawRect(Rect.FromLTWH(0, CmdBarHeight + 5, W, H - CmdBarHeight - 5), paint);

        base.OnPaint(canvas, area);
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