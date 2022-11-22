import * as PixUI from '@/PixUI'
import * as System from '@/System'
import {Channel, initializeAppBoxClient, WebChannel} from '@/AppBoxClient';
import {CodeEditorController, CodeEditorWidget} from "@/CodeEditor";
import * as AppBoxDesign from './AppBoxDesign/Generated/HomePage'

class TreeData {
    public readonly Icon: PixUI.IconData;
    public readonly Text: string;
    public readonly Children: System.List<TreeData> | null;

    constructor(icon: PixUI.IconData, text: string, children: System.List<TreeData> | null = null) {
        this.Icon = icon;
        this.Text = text;
        this.Children = children;
    }
}

class DemoWidget {
    public static Make1(): PixUI.Widget {
        let color = PixUI.Colors.Red.obs;
        let size = (30).obs;

        return new PixUI.Column().Init({
            Children: [
                new PixUI.Button("Button".obs).Init({
                    OnTap: (e) => {
                        color.Value = PixUI.Colors.Random();
                        size.Value = clamp(Math.random() * 100, 18, 100);
                    }
                }),
                new PixUI.Text("Hello中国".obs).Init({TextColor: color, FontSize: size}),
                new PixUI.Input("Hello".obs).Init({Width: (180).obs})
            ]
        })
    }

    public static Make2(): PixUI.Widget {
        let _expandController = new PixUI.AnimationController(200);
        let _expandCurve = new PixUI.CurvedAnimation(_expandController, PixUI.Curves.EaseInOutCubic);
        let _expandArrowAnimation = new PixUI.FloatTween(0.75, 1.0).Animate(_expandCurve);

        let button = new PixUI.ExpandIcon(_expandArrowAnimation);
        button.OnPointerDown = e => {
            if (_expandController.Value == 0)
                _expandController.Forward();
            else
                _expandController.Reverse();
        };
        return button;
    }

    public static DemoTransform(): PixUI.Widget {
        let m2 = PixUI.Matrix4.CreateIdentity();
        m2.Translate(25, 25);
        m2.RotateZ(20 * (Math.PI / 180));

        return new PixUI.Container().Init({
            Width: (300).obs, Height: (300).obs,
            BgColor: PixUI.Colors.Green.obs,
            Child: new PixUI.Transform(m2, new PixUI.Offset(50, 50)).Init({
                Child: new PixUI.Container().Init({
                    Width: (100).obs, Height: (100).obs,
                    BgColor: PixUI.Colors.Red.obs,
                })
            }),
        });
    }

    public static DemoTreeView(): PixUI.Widget {
        let _treeDataSource = new System.List<TreeData>([
            new TreeData(PixUI.Icons.Filled.Cloud, "Cloud", new System.List<TreeData>([
                new TreeData(PixUI.Icons.Filled.Train, "Train"),
                new TreeData(PixUI.Icons.Filled.AirplanemodeOn, "AirPlane")
            ])),
            new TreeData(PixUI.Icons.Filled.BeachAccess, "Beach", new System.List<TreeData>([
                new TreeData(PixUI.Icons.Filled.Cake, "Cake", new System.List<TreeData>([
                    new TreeData(PixUI.Icons.Filled.Apple, "Apple"),
                    new TreeData(PixUI.Icons.Filled.Adobe, "Adobe"),
                ])),
                new TreeData(PixUI.Icons.Filled.Camera, "Camera"),
            ])),
            new TreeData(PixUI.Icons.Filled.Sunny, "Sunny"),
        ]);

        let _treeController = new PixUI.TreeController<TreeData>((data, node) => {
            node.Icon = new PixUI.Icon(PixUI.State.op_Implicit_From(data.Icon));
            node.Label = new PixUI.Text(data.Text.obs);
            node.IsLeaf = data.Children == null;
            //node.IsExpanded = data.Text == "Cloud";
        }, (d) => d.Children);
        _treeController.DataSource = _treeDataSource;

        return new PixUI.Container().Init({
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
            Child: new PixUI.TreeView<TreeData>(_treeController).Init({
                Color: new PixUI.Color(0xFFDCDCDC).obs,
            }),
        });
    }

    public static MakeCodeEditor(): PixUI.Widget {
        const srcCode = `
public sealed class Person
{
    public string Name { get; set; }

    public void SayHello()
    {
        System.Console.WriteLine(Name);
    }
} //中国 */
`

        let controller = new CodeEditorController("Demo.cs", srcCode);
        return new PixUI.Container().Init({
            Padding: new PixUI.Rx(PixUI.EdgeInsets.All(20)),
            Child: new CodeEditorWidget(controller)
        });
    }

    public static MakeDev(): PixUI.Widget {
        return new AppBoxDesign.HomePage();
    }
}

// 初始化Channel
Channel.Init(new WebChannel());
// 初始化PixUI
PixUI.WebApplication.Init();
// 初始化AppBoxClient的一些扩展方法
initializeAppBoxClient();
// PixUI.PaintDebugger.Switch();
// 开始运行
PixUI.WebApplication.Run(DemoWidget.MakeDev);


