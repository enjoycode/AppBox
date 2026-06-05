using AppBoxCore;

namespace AppBox.Workflow;

public sealed class SingleHumanActivity : HumanActivity
{
    private const string WaitAssignHuman = "WaitAssignHuman";
    private const string WaitHumanAction = "WaitHumanAction";

    private Activity[] _links;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        _links = new Activity[Actions.Length];
    }

    private int FindActionIndex(string name)
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

    internal override void LinkTo(Activity target, FlowLink link)
    {
        var index = FindActionIndex(link.Name);
        if (index == -1)
            throw new Exception($"Can not find Action with name: {link.Name}");

        _links[index] = target;
    }

    internal override IExecuteResult? Execute(WorkflowInstance instance)
    {
        //1.找到对应的组织单元ID
        var ids = new List<Guid>();
        for (var i = 0; i < Humans.Length; i++)
        {
            var idExpression = Humans[i].OrgUnitExpression;
            if (idExpression is ConstantExpression constant && constant.Value.Type == AnyValue.ValueType.Guid)
            {
                ids.Add(constant.Value.GetGuid()!.Value);
            }
            else
            {
                throw new NotImplementedException();
            }
        }

        //2.判断是否一个都没有
        if (ids.Count == 0)
            return new Bookmark(this, WaitAssignHuman, []);

        //3.新建Bookmark并返回
        return new Bookmark(this, WaitHumanAction, ids.ToArray());
    }

    internal override ResumeResult Resume(string bookmarkName, IHumanActionResult result)
    {
        if (bookmarkName == WaitHumanAction)
        {
            var humanResult = (HumanActionResult)result;
            //找到对应的Action
            var index = FindActionIndex(humanResult.Result);
            if (index == -1)
                throw new Exception($"找不到单人活动提交的操作结果: {humanResult.Result}");
            //直接返回，注意：不保存由调用者处理
            return new ResumeResult() { Suspended = false, CancelOthers = true, Next = _links[index] };
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
        ws.WriteVariant(_links.Length);
        for (var i = 0; i < _links.Length; i++)
        {
            ws.Serialize(_links[i]);
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
                    _links = new Activity[count];
                    for (var i = 0; i < count; i++)
                    {
                        _links[i] = (Activity)rs.Deserialize()!;
                    }

                    break;
                }
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(SingleHumanActivity), propIndex);
            }
        } while (true);
    }

    #endregion
}