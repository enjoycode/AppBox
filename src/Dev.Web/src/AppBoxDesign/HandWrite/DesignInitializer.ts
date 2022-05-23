import {DesignTree, CompletionItem} from '@/AppBoxDesign'
import {TSCSharpLanguage} from "@/CodeEditor";
import {PayloadType, TypeSerializer} from "@/AppBoxCore";

export class DesignInitializer {
    public static async TryInit(): Promise<void> {
        if (TypeSerializer.GetSerializer(PayloadType.DesignTree) != null)
            return;

        // 初始化TreeSitter
        const TreeSitter: any = (<any>window).TreeSitter;
        await TreeSitter.init();
        let csharpLanguage = await TreeSitter.Language.load('/tree-sitter-c_sharp.wasm');
        TSCSharpLanguage.Init(csharpLanguage);

        // 注册序列化器
        TypeSerializer.RegisterKnownType(PayloadType.DesignTree, false, () => new DesignTree());
        TypeSerializer.RegisterKnownType(PayloadType.CompletionItem, true, () => new CompletionItem());
    }
}