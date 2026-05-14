namespace AppBoxCore;

public sealed class WorkflowModel : ModelBase
{
    internal WorkflowModel()
    {
        StartActivity = new StartActivityModel();
    }

    public WorkflowModel(ModelId modelId, string name) : base(modelId, name)
    {
        StartActivity = new StartActivityModel();
    }

    //TODO:添加默认视图表达式属性

    public StartActivityModel StartActivity { get; }

    public List<WorkflowParameter> Parameters { get; set; } = [];

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteFieldId(1);
        StartActivity.WriteTo(ws);

        if (Parameters.Count > 0)
        {
            ws.WriteFieldId(2);
            ws.WriteCollection(Parameters);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        int propIndex;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: StartActivity.ReadFrom(rs); break;
                case 2: rs.ReadCollection(Parameters); break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(WorkflowModel), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}