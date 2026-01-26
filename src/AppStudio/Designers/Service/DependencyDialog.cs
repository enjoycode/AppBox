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
                                Child = new ListView<string>(BuildListItem, null, _sourceListController),
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
                        new Button(">"),
                        new Button("<")
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
                                Child = new ListView<string>(BuildListItem, null, _targetListController)
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

    private Widget BuildListItem(string value, int index)
    {
        return new Row()
        {
            Children =
            [
                new SelectableItem(index,
                    _hoveredSource.ToComputed(idx => idx == index, v => { _hoveredSource.Value = v ? index : -1; }),
                    _selectedSource.ToComputed(idx => idx == index),
                    idx => _selectedSource.Value = idx)
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
        var list = await Channel.Invoke<string[]>(DesignMethods.GetExtLibrariesFull, [appName]);
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
            //TODO:加入Source列表内
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
}