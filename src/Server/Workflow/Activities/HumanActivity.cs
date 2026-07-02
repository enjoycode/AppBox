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
    protected async Task<IReadOnlyList<Guid>> GetOrgUnits(WorkflowInstance instance)
    {
        var result = new List<Guid>();
        try
        {
            for (var i = 0; i < Actors.Length; i++)
            {
                var expression = Actors[i].OrgUnitExpression;
                if (expression is ConstantExpression constant)
                {
                    if (constant.Value.Type == AnyValue.ValueType.Guid) //FromAssigned
                    {
                        result.Add(constant.Value.GetGuid()!.Value);
                    }
                    else //FromWorkflowActorService
                    {
                        var methodName = constant.Value.BoxedValue!.ToString();
                        var orgUnits = await RuntimeContext.Current.InvokeAsync(
                            $"sys.WorkflowActorService.{methodName}",
                            AnyArgs.Make(instance.CreatorId));
                        result.AddRange((Guid[])orgUnits.BoxedValue!);
                    }
                }
                else //FromExpression
                {
                    throw new NotImplementedException("GetOrgUnits from expression is not implemented");
                }
            }
        }
        catch (Exception e)
        {
            Logger.Error($"[{instance.Title}].[{Title}]: {e.Message}\n{e.StackTrace}");
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