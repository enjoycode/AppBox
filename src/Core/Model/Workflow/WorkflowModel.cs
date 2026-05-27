namespace AppBoxCore;

public sealed class WorkflowModel : ModelBase
{
    internal WorkflowModel()
    {
        StartNode = new StartNode();
    }

    public WorkflowModel(ModelId modelId, string name) : base(modelId, name)
    {
        StartNode = new StartNode();
    }

    //TODO:添加默认视图表达式属性

    public StartNode StartNode { get; }

    public List<WorkflowParameter> Parameters { get; } = [];

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
        StartNode.WriteTo(ref ws);

        if (Parameters.Count > 0)
        {
            ws.WriteFieldId(2);
            ws.WriteCollection(Parameters);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        int propIndex;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: StartNode.ReadFrom(ref rs); break;
                case 2: rs.ReadCollection(Parameters); break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(WorkflowModel), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}