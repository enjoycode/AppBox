import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'
import {Channel, WebChannel, PayloadType, TypeSerializer} from "@/AppBoxClient";

import {CodeEditorController, CodeEditorWidget, TSCSharpLanguage} from "@/CodeEditor";

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
                new PixUI.Text("Hello中国".obs).Init({Color: color, FontSize: size}),
                new PixUI.Input("Hello".obs).Init({Width: (180).obs})
            ]
        })
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

// 初始化TreeSitter
const TreeSitter: any = (<any>window).TreeSitter;
TreeSitter.init().then(async (res: any) => {
    let csharpLanguage = await TreeSitter.Language.load('/tree-sitter-c_sharp.wasm');
    TSCSharpLanguage.Init(csharpLanguage);

    //暂在这里注册序列化
    TypeSerializer.RegisterKnownType(PayloadType.DesignTree, false, () => new AppBoxDesign.DesignTree());

    // 初始化Channel
    Channel.Init(new WebChannel());
    // 初始化PixUI
    PixUI.WebApplication.Init();
    // PixUI.PaintDebugger.Switch();
    // 开始运行
    PixUI.WebApplication.Run(DemoWidget.MakeDev);
});



