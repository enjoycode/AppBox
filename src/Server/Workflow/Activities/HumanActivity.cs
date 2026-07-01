using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public abstract class HumanActivity : Activity
{
    protected HumanActivity() { }

    protected HumanActivity(string title, HumanActor[] actors, HumanAction[] actions, ModelId? formModelId = null) :
        base(title)
    {
        Actors = actors;
        Actions = actions;
        FormModelId = formModelId;
    }

    public HumanActor[] Actors { get; private set; } = null!;
    public HumanAction[] Actions { get; private set; } = null!;
    public ModelId? FormModelId { get; private set; }

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var humanNode = (HumanNode)node;
        if (humanNode.Actions.Count == 0)
            throw new Exception("Can not find any Action in HumanActivity");
        if (humanNode.Actors.Count == 0)
            throw new Exception("Can not find and Actor in HumanActivity");

        Actions = humanNode.Actions.ToArray();
        Actors = humanNode.Actors.ToArray();
        FormModelId = humanNode.FormModelId;
    }

    /// <summary>
    /// 获取人员活动的参与者
    /// </summary>
    protected IReadOnlyList<Guid> GetOrgUnits()
    {
        var result = new List<Guid>();
        for (var i = 0; i < Actors.Length; i++)
        {
            var idExpression = Actors[i].OrgUnitExpression;
            if (idExpression is ConstantExpression constant && constant.Value.Type == AnyValue.ValueType.Guid)
            {
                result.Add(constant.Value.GetGuid()!.Value);
            }
            else
            {
                throw new NotImplementedException();
            }
        }

        return result;
    }

    protected int FindActionIndex(string name)
    {
        var index = -1;
        for (var i = 0; i < Actions.Length; i++)
        {
            if (Actions[i].Name == name)
            {
                index = i;
                break;
            }
        }

        return index;
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteArray(Actors);
        ws.WriteArray(Actions);

        ws.WriteBool(FormModelId.HasValue);
        if (FormModelId.HasValue)
            ws.WriteLong(FormModelId.Value);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        
        Actors = rs.ReadArray<TReader, HumanActor>();
        Actions = rs.ReadArray<TReader, HumanAction>();

        var hasFormModelId = rs.ReadBool();
        if (hasFormModelId)
            FormModelId = rs.ReadLong();

        rs.ReadFieldId(); //保留
    }

    #endregion
}