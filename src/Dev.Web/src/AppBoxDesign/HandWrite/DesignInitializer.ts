import {
    DesignTreeVO, CompletionItem, NewNodeResult, ChangedModel, CodeProblem,
    EntityModelVO, EntityFieldVO, EntityRefVO, EntitySetVO, EntityMemberInfo, ReferenceVO
} from '@/AppBoxDesign'
import {TSCSharpLanguage} from "@/CodeEditor";
import {FieldWithOrder, PayloadType, TypeSerializer} from "@/AppBoxCore";

export class DesignInitializer {
    public static async TryInit(): Promise<void> {
        if (TypeSerializer.GetSerializer(PayloadType.DesignTree) != null)
            return;

        // 初始化TreeSitter
        const TreeSitter: any = (<any>window).TreeSitter;
        await TreeSitter.init();
        let csharpLanguage = await TreeSitter.Language.load('/tree-sitter-c_sharp.wasm');
        TSCSharpLanguage.Init(csharpLanguage);

        // 注册序列化器(仅反序列化后端设计时类型)
        TypeSerializer.RegisterKnownType(PayloadType.EntityModelVO, false, () => new EntityModelVO());
        //TypeSerializer.RegisterKnownType(PayloadType.EntityMemberVO, false);
        TypeSerializer.RegisterKnownType(PayloadType.EntityFieldVO, false, () => new EntityFieldVO());
        TypeSerializer.RegisterKnownType(PayloadType.EntityRefVO, false, () => new EntityRefVO());
        TypeSerializer.RegisterKnownType(PayloadType.EntitySetVO, false, () => new EntitySetVO());
        TypeSerializer.RegisterKnownType(PayloadType.EntityMemberInfo, false, () => new EntityMemberInfo());
        TypeSerializer.RegisterKnownType(PayloadType.DesignTree, false, () => new DesignTreeVO());
        TypeSerializer.RegisterKnownType(PayloadType.NewNodeResult, false, () => new NewNodeResult());
        TypeSerializer.RegisterKnownType(PayloadType.CodeProblem, true, () => new CodeProblem());
        TypeSerializer.RegisterKnownType(PayloadType.CompletionItem, true, () => new CompletionItem());
        TypeSerializer.RegisterKnownType(PayloadType.ChangedModel, true, () => new ChangedModel());
        TypeSerializer.RegisterKnownType(PayloadType.FieldWithOrder, true, () => new FieldWithOrder());
        TypeSerializer.RegisterKnownType(PayloadType.ReferenceVO, false, () => new ReferenceVO());
    }
}