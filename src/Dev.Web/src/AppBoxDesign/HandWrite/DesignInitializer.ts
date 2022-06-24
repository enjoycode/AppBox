import {DesignTree, CompletionItem, NewNodeResult, ChangedModel, CodeProblem} from '@/AppBoxDesign'
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
        TypeSerializer.RegisterKnownType(PayloadType.NewNodeResult, false, () => new NewNodeResult());
        TypeSerializer.RegisterKnownType(PayloadType.CodeProblem, true, () => new CodeProblem());
        TypeSerializer.RegisterKnownType(PayloadType.CompletionItem, true, () => new CompletionItem());
        TypeSerializer.RegisterKnownType(PayloadType.ChangedModel, true, () => new ChangedModel());
    }
}