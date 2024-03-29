using System.Threading.Tasks;
using PixUI;
using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 初始化设计时，eg:注册序列化器等
/// </summary>
[TSType("AppBoxDesign.DesignInitializer")]
public static class DesignInitializer
{
    static DesignInitializer()
    {
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityModelVO,
            typeof(EntityModelVO), () => new EntityModelVO()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityMemberVO,
            typeof(EntityMemberVO)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityFieldVO,
            typeof(EntityFieldVO), () => new EntityFieldVO()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityRefVO,
            typeof(EntityRefVO), () => new EntityRefVO()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntitySetVO,
            typeof(EntitySetVO), () => new EntitySetVO()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityMemberInfo,
            typeof(EntityMemberInfo), () => new EntityMemberInfo()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.DesignTree,
            typeof(DesignTreeVO), () => new DesignTreeVO()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.NewNodeResult,
            typeof(NewNodeResult), () => new NewNodeResult()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.CodeProblem,
            typeof(CodeProblem), () => new CodeProblem()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.CompletionItem,
            typeof(CompletionItem), () => new CompletionItem()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.ChangedModel,
            typeof(ChangedModel), () => new ChangedModel()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.OrderedField,
            typeof(OrderedField), () => new OrderedField()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.ReferenceVO,
            typeof(ReferenceVO), () => new ReferenceVO()));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.TextChange,
            typeof(TextChange), () => new TextChange()));
    }

    public static Task TryInit() => Task.CompletedTask; //do noting for native
}