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
    public ModelId? FormModelId { get; private set; }
    public HumanAction[] Actions { get; private set; } = null!;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var humanNode = (HumanNode)node;
        if (humanNode.Actions.Count == 0)
            throw new Exception("Can not find any Action in HumanActivity");
        if (humanNode.Actors.Count == 0)
            throw new Exception("Can not find and Actor in HumanActivity");

        Actions = humanNode.Actions.ToArray();
        FormModelId = humanNode.FormModelId;
        Actors = humanNode.Actors.ToArray();
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

        ws.WriteFieldId(1);
        ws.WriteVariant(Actors.Length);
        for (var i = 0; i < Actors.Length; i++)
        {
            Actors[i].WriteTo(ref ws);
        }

        ws.WriteFieldId(2);
        ws.WriteVariant(Actions.Length);
        for (var i = 0; i < Actions.Length; i++)
        {
            Actions[i].WriteTo(ref ws);
        }

        if (FormModelId.HasValue)
        {
            ws.WriteFieldId(3);
            ws.WriteLong(FormModelId.Value);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        do
        {
            var propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1:
                {
                    var count = rs.ReadVariant();
                    Actors = new HumanActor[count];
                    for (var i = 0; i < count; i++)
                    {
                        var who = new HumanActor();
                        who.ReadFrom(ref rs);
                        Actors[i] = who;
                    }

                    break;
                }
                case 2:
                {
                    var count = rs.ReadVariant();
                    Actions = new HumanAction[count];
                    for (var i = 0; i < count; i++)
                    {
                        var act = new HumanAction();
                        act.ReadFrom(ref rs);
                        Actions[i] = act;
                    }

                    break;
                }
                case 3: FormModelId = rs.ReadLong(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(HumanActivity), propIndex);
            }
        } while (true);
    }

    #endregion
}