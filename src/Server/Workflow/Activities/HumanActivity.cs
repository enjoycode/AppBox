using AppBoxCore;

namespace AppBox.Workflow;

public abstract class HumanActivity : Activity
{
    internal HumanSource[] Humans { get; private set; }
    internal ModelId? FormModelId { get; private set; }
    internal HumanAction[] Actions { get; private set; }

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var humanNode = (HumanNode)node;
        if (humanNode.Actions.Count == 0)
            throw new Exception("Can not find any Action in HumanActivity");
        if (humanNode.HumanSource.Count == 0)
            throw new Exception("Can not find and Human in HumanActivity");

        Actions = humanNode.Actions.ToArray();
        FormModelId = humanNode.FormModelId;
        Humans = humanNode.HumanSource.ToArray();
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
        ws.WriteVariant(Humans.Length);
        for (var i = 0; i < Humans.Length; i++)
        {
            Humans[i].WriteTo(ref ws);
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
                    Humans = new HumanSource[count];
                    for (var i = 0; i < count; i++)
                    {
                        var who = new HumanSource();
                        who.ReadFrom(ref rs);
                        Humans[i] = who;
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