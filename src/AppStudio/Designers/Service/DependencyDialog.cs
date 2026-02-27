using AppBoxClient;
using AppBoxCore;
using PixUI;
using PixUI.Platform;

namespace AppBoxDesign;

internal sealed class DependencyDialog : Dialog
{
    public DependencyDialog(ModelNode modelNode)
    {
        Title.Value = "Dependencies";
        Width = 600;
        Height = 400;

        _modelNode = modelNode;
    }

    private readonly ModelNode _modelNode;
    private ServiceModel ServiceModel => (ServiceModel)_modelNode.Model;
    private readonly ListViewController<ModelDependency> _sourceListController = new();
    private readonly ListViewController<ModelDependency> _targetListController = new();
    private readonly Color _fillColor = new(0xFFF3F3F3);
    private readonly State<int> _selectedSource = -1;
    private readonly State<int> _hoveredSource = -1;
    private readonly State<int> _selectedTarget = -1;
    private readonly State<int> _hoveredTarget = -1;

    public List<ModelDependency> Result => _targetListController.DataSource as List<ModelDependency> ?? [];

    protected override Widget BuildBody() => new Container()
    {
        Padding = EdgeInsets.All(20),
        Child = new Row()
        {
            Spacing = 10,
            Children =
            [
                new Expanded(new Column()
                    {
                        Alignment = HorizontalAlignment.Left,
                        Children =
                        [
                            new Text("Available:"),
                            new Container()
                            {
                                FillColor = _fillColor,
                                Child = new ListView<ModelDependency>(BuildSourceListItem, null, _sourceListController),
                            }
                        ]
                    }
                ),

                new Column()
                {
                    Width = 60,
                    Spacing = 10,
                    Children =
                    [
                        new Button(">") { OnTap = _ => OnAdd() },
                        new Button("<") { OnTap = _ => OnRemove() }
                    ]
                },

                new Expanded(new Column()
                    {
                        Alignment = HorizontalAlignment.Left,
                        Children =
                        [
                            new Text("Selected:"),
                            new Container()
                            {
                                FillColor = _fillColor,
                                Child = new ListView<ModelDependency>(BuildTargetListItem, null, _targetListController)
                            }
                        ]
                    }
                ),
            ]
        }
    };

    protected override Widget BuildFooter() => new Container
    {
        Height = Button.DefaultHeight + 20 + 20,
        Padding = EdgeInsets.All(20),
        Child = new Row(VerticalAlignment.Middle, 20)
        {
            Children =
            {
                new Expanded(),
                new Button("Upload") { Width = 80, OnTap = _ => OnUpload() },
                new Button(DialogResult.Cancel) { Width = 80, OnTap = _ => Close(DialogResult.Cancel) },
                new Button(DialogResult.OK) { Width = 80, OnTap = _ => Close(DialogResult.OK) }
            }
        }
    };

    private Row BuildSourceListItem(ModelDependency value, int index) =>
        BuildListItem(value, index, _hoveredSource, _selectedSource);

    private Row BuildTargetListItem(ModelDependency value, int index) =>
        BuildListItem(value, index, _hoveredTarget, _selectedTarget);

    private static Row BuildListItem(ModelDependency value, int index, State<int> hoverState,
        State<int> selectedState) => new()
    {
        Children =
        [
            new SelectableItem(index,
                hoverState.ToComputed(idx => idx == index, v => { hoverState.Value = v ? index : -1; }),
                selectedState.ToComputed(idx => idx == index),
                idx => selectedState.Value = idx)
            {
                Height = 22,
                Child = new Container()
                {
                    Padding = EdgeInsets.Only(5, 2, 2, 5),
                    Child = new Text(value.AssemblyName)
                }
            }
        ]
    };

    protected override void OnMounted()
    {
        base.OnMounted();

        //先加载已选择的依赖项
        if (ServiceModel.Dependencies != null && ServiceModel.Dependencies.Count != 0)
            _targetListController.DataSource = ServiceModel.Dependencies;

        //后加载所有依赖项
        LoadSourceList();
    }

    private async void LoadSourceList()
    {
        try
        {
            var appName = _modelNode.AppNode.Model.Name;
            var extLibs = (await Channel.Invoke<List<string>>(DesignMethods.GetExtLibrariesFull, [appName]))!
                .Select(name => new ModelDependency()
                {
                    Type = ModelDependencyType.ServerExtLibrary,
                    AssemblyName = name
                })
                .ToList();
            if (_targetListController.DataSource != null && _targetListController.DataSource.Count != 0)
            {
                if (extLibs.RemoveAll(name => _targetListController.DataSource.Contains(name)) > 0)
                    extLibs = extLibs.ToList();
            }


            _sourceListController.DataSource = extLibs;
        }
        catch (Exception e)
        {
            Notification.Error($"Load available library error: {e.Message}");
        }
    }

    private async void OnUpload()
    {
        Stream? fileStream = null;
        try
        {
            var options = new OpenFileOptions();
            var files = await FileDialog.OpenFileAsync(options);
            if (files.Length <= 0)
                return;

            var appName = _modelNode.AppNode.Model.Name;
            var fileName = files[0].FileName;
            fileStream = files[0].FileStream;

            var assemblyFlag = await Channel.Invoke<byte>(DesignMethods.UploadExtAssemblyFull, ws =>
            {
                ws.WriteString(appName);
                ws.WriteString(fileName);
                fileStream.CopyTo(ws);
            });
            //TODO:加入Source列表内，并通知已经依赖的更新
        }
        catch (Exception ex)
        {
            Notification.Error($"Upload Error: {ex.Message}");
        }
        finally
        {
            fileStream?.Close();
        }
    }

    private void OnAdd()
    {
        var index = _selectedSource.Value;
        if (index < 0)
            return;

        var sourceList = (List<ModelDependency>)_sourceListController.DataSource!;
        List<ModelDependency> targetList;
        if (_targetListController.DataSource is List<ModelDependency> list)
            targetList = list;
        else
            targetList = [];

        var value = sourceList[index];
        sourceList.RemoveAt(index);
        _selectedSource.Value = -1;
        targetList.Add(value);
        targetList.Sort();
        _sourceListController.DataSource = sourceList;
        _targetListController.DataSource = targetList;
    }

    private void OnRemove()
    {
        var index = _selectedTarget.Value;
        if (index < 0)
            return;

        var sourceList = (List<ModelDependency>)_sourceListController.DataSource!;
        var targetList = (List<ModelDependency>)_targetListController.DataSource!;
        var value = targetList[index];
        targetList.RemoveAt(index);
        _selectedTarget.Value = -1;
        sourceList.Add(value);
        sourceList.Sort();
        _sourceListController.DataSource = sourceList;
        _targetListController.DataSource = targetList;
    }
}