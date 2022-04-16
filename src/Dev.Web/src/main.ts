import * as PixUI from '@/PixUI'
import {TSCSharpLanguage} from "@/CodeEditor";

// 初始化TreeSitter
const TreeSitter: any = (<any>window).TreeSitter;
TreeSitter.init().then(async () => {
    let csharpLanguage = await TreeSitter.Language.load('/tree-sitter-csharp.wasm');
    TSCSharpLanguage.Init(csharpLanguage);

    // 初始化PixUI
    PixUI.WebApplication.Init();

    let color = PixUI.Colors.Red.obs;
    let size = (30).obs;
    let root = new PixUI.Column().Init({
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

    // PixUI.PaintDebugger.Switch();

    PixUI.WebApplication.Run(root);
});



