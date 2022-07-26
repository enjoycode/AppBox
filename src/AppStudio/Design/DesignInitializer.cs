using System.Threading.Tasks;
using PixUI;
using AppBoxCore;

namespace AppBoxDesign
{
    /// <summary>
    /// 初始化设计时，eg:注册序列化器等
    /// </summary>
    [TSType("AppBoxDesign.DesignInitializer")]
    public static class DesignInitializer
    {
        public static Task TryInit()
        {
            TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityModelVO, typeof(EntityModelVO), () => new EntityModelVO()));
            TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.DesignTree, typeof(DesignTree), () => new DesignTree()));
            TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.NewNodeResult, typeof(NewNodeResult), () => new NewNodeResult()));
            TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.CodeProblem, typeof(CodeProblem), () => new CodeProblem()));
            TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.CompletionItem, typeof(CompletionItem), () => new CompletionItem()));
            TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.ChangedModel, typeof(ChangedModel), () => new ChangedModel()));
            TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.FieldWithOrder, typeof(FieldWithOrder), () => new FieldWithOrder()));

            return Task.CompletedTask;
        }
    }
}