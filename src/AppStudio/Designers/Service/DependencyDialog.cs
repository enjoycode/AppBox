using AppBoxClient;
using AppBoxCore;
using PixUI;
using PixUI.Platform;
using Roslyn.Utilities;

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
    private readonly ListViewController<string> _sourceListController = new();
    private readonly ListViewController<string> _targetListController = new();
    private readonly Color _fillColor = new(0xFFF3F3F3);
    private readonly State<int> _selectedSource = -1;
    private readonly State<int> _hoveredSource = -1;
    private readonly State<int> _selectedTarget = -1;
    private readonly State<int> _hoveredTarget = -1;

    public List<string> Result => _targetListController.DataSource as List<string> ?? [];

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
                                Child = new ListView<string>(BuildSourceListItem, null, _sourceListController),
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
                                Child = new ListView<string>(BuildTargetListItem, null, _targetListController)
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

    private Widget BuildSourceListItem(string value, int index) =>
        BuildListItem(value, index, _hoveredSource, _selectedSource);

    private Widget BuildTargetListItem(string value, int index) =>
        BuildListItem(value, index, _hoveredTarget, _selectedTarget);

    private static Widget BuildListItem(string value, int index, State<int> hoverState, State<int> selectedState)
    {
        return new Row()
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
                        Child = new Text(value)
                    }
                }
            ]
        };
    }

    protected override void OnMounted()
    {
        base.OnMounted();

        LoadSourceList();
    }

    private async void LoadSourceList()
    {
        var appName = _modelNode.AppNode.Model.Name;
        var list = (await Channel.Invoke<List<string>>(DesignMethods.GetExtLibrariesFull, [appName]))!;
        if (_targetListController.DataSource != null && _targetListController.DataSource.Any())
        {
            if (list.RemoveAll(name => _targetListController.DataSource.Contains(name)) > 0)
                list = list.ToList();
        }


        _sourceListController.DataSource = list;
    }

    private async void OnUpload()
    {
        var options = new OpenFileOptions();
        var files = await FileDialog.OpenFileAsync(options);
        if (files.Length <= 0)
            return;

        var appName = _modelNode.AppNode.Model.Name;
        var fileName = files[0].FileName;
        var fileStream = files[0].FileStream;
        try
        {
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
            fileStream.Close();
        }
    }

    private void OnAdd()
    {
        var index = _selectedSource.Value;
        if (index < 0)
            return;

        var sourceList = (List<string>)_sourceListController.DataSource!;
        List<string> targetList;
        if (_targetListController.DataSource is List<string> list)
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

        var sourceList = (List<string>)_sourceListController.DataSource!;
        var targetList = (List<string>)_targetListController.DataSource!;
        var value = targetList[index];
        targetList.RemoveAt(index);
        _selectedTarget.Value = -1;
        sourceList.Add(value);
        sourceList.Sort();
        _sourceListController.DataSource = sourceList;
        _targetListController.DataSource = targetList;
    }
}