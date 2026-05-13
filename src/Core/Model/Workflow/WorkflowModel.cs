namespace AppBoxCore;

public sealed class WorkflowModel : ModelBase
{
    internal WorkflowModel() { }

    public WorkflowModel(ModelId modelId, string name) : base(modelId, name)
    {
        StartActivity = new StartActivityModel();
    }

    //TODO:添加默认视图表达式属性

    public StartActivityModel StartActivity { get; private set; } = null!;

    public List<WorkflowParameter> Parameters { get; set; } = [];

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteFieldId(1);
        ws.Serialize(StartActivity);

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
                case 1: StartActivity = (StartActivityModel)rs.Deserialize()!; break;
                case 2: rs.ReadCollection(Parameters); break;
                case 0: break;
                default: throw new Exception($"Deserialize_ObjectUnknownFieldIndex: {nameof(WorkflowModel)}");
            }
        } while (propIndex != 0);
    }

    #endregion
}