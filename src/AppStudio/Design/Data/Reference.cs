using AppBoxCore;
using Microsoft.CodeAnalysis.Text;

namespace AppBoxDesign;

/// <summary>
/// 模型或其成员的引用者的基类，目前分为两类：
/// 1. 模型对模型的引用
/// 2. 模型内虚拟代码对模型的引用
/// </summary>
internal abstract class Reference : ILocation, IComparable<Reference>
{
    public Reference(ModelNode modelNode)
    {
        ModelNode = modelNode ?? throw new ArgumentNullException();
    }
    
    public ModelNode ModelNode { get; private set; }

    public string ModelId => ModelNode.Model.Id.ToString();

    public string ModelName => $"{ModelNode.AppNode.Model.Name}.{ModelNode.Model.Name}";

    /// <summary>
    /// 用于友好显示的位置信息
    /// </summary>
    public abstract string Location { get; }

    public virtual int Offset { get; } = -1;

    public virtual int Length { get; } = -1;

    //public abstract String Expression { get; }

    public int CompareTo(Reference? other)
    {
        if (other == null) return 0;
        
        if (ModelNode.Model.ModelType != other.ModelNode.Model.ModelType
            || ModelNode.Model.Id != other.ModelNode.Model.Id)
            return ModelNode.Model.Id.CompareTo(other.ModelNode.Model.Id);

        return CompareSameModel(other);
    }

    public virtual int CompareSameModel(Reference other)
    {
        return 0;
    }

    public override string ToString()
    {
        return $"{ModelNode.AppNode.Model.Name}.{CodeUtil.GetPluralStringOfModelType(ModelNode.Model.ModelType)}.{ModelNode.Model.Name} at {Location}";
    }
}

/// <summary>
/// 模型内虚拟代码的引用
/// </summary>
internal sealed class CodeReference : Reference
{

    #region ====Properties====
    public override int Offset { get; }

    public override int Length { get; }

    public override string Location => $"[{Offset} - {Length}]";

    //private string _expression;
    //public override string Expression
    //{ get { return _expression; } }
    #endregion

    #region ====Ctor====
    public CodeReference(ModelNode modelNode, int offset, int length) : base(modelNode)
    {
        Offset = offset;
        Length = length;
        //this._expression = expression;
    }
    #endregion

    #region ====Methods====

    public override int CompareSameModel(Reference other)
    {
        var r = (CodeReference)other;
        //Log.Warn($"Compare CodeReference: {Offset} {r.Offset}");
        return Offset.CompareTo(r.Offset);
    }

    /// <summary>
    /// 重命名
    /// </summary>
    internal void Rename(DesignHub hub, int diff, string newName)
    {
        var document = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(ModelNode.RoslynDocumentId)!;
        var sourceText = document.GetTextAsync().Result;
        var startOffset = Offset + diff;

        sourceText = sourceText.WithChanges(new TextChange(new TextSpan(startOffset, Length), newName));
        hub.TypeSystem.Workspace.OnDocumentChanged(ModelNode.RoslynDocumentId!, sourceText);
    }
    #endregion
}

/// <summary>
/// 模型对模型的引用，如表达式引用
/// </summary>
internal sealed class ModelReference : Reference
{
    public ModelReferenceInfo TargetReference { get; }

    public override string Location => TargetReference.TargetType.ToString();

    //public override string Expression
    //{
    //    get
    //    {
    //        if (_modelReference == null)
    //            return null;
    //        return this._modelReference.Expression;
    //    }
    //}

    #region ====Ctor====
    public ModelReference(ModelNode modelNode, ModelReferenceInfo modelReference)
        : base(modelNode)
    {
        TargetReference = modelReference;
    }
    #endregion
}