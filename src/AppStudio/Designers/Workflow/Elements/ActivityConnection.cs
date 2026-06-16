using AppBoxCore;
using PixUI.Diagram;

namespace AppBoxDesign;

/// <summary>
/// 用于工作流设计器的连接线，监测Source及Target的改变，修改相应的模型的流转
/// </summary>
internal sealed class ActivityConnection : DiagramConnection, IActivityConnection
{
    public ActivityConnection()
    {
        BackColor = ActivityPainter.ConnectionBackColor;
        TargetCapType = CapType.Arrow2Filled;
        StrokeThickness = ActivityPainter.ConnectionThickness;
        ForeColor = ActivityPainter.ConnectionLineColor;
        Route = true;
    }

    /// <summary>
    /// 仅供设计器WorkflowDesignVisitor初始化加载调用
    /// </summary>
    internal ActivityConnection(FlowLink link, ActivityDesigner source, ActivityDesigner target) : this()
    {
        _isLoading = true;
        Link = link;
        Link.DiagramConnection = this;
        SourceConnectorPosition = link.SourceConnector.ToString();
        Source = source;
        TargetConnectorPosition = link.TargetConnector.ToString();
        Target = target;
        _isLoading = false;
    }

    private FlowLink? _preSourceLink; //TODO:临时方案用于解决移动已连接源至相同的源但Connector不同
    private IShape? _preSource; //同上组合

    private bool _isLoading;

    public FlowLink? Link { get; private set; }

    public override string? Title
    {
        get => Link?.Title;
        set
        {
            throw new NotSupportedException(); //暂不支持修改
            // if (Link != null)
            // {
            //     //暂直接修改单人活动的连接名称所对应的Action.Name
            //     var designer = (ActivityDesigner)Source!;
            //     if (designer.Model is SingleHumanActivityModel singleHumanActivityModel)
            //     {
            //         var act = singleHumanActivityModel.Actions.Single(t => t.Name == Link.Name);
            //         act.Name = value ?? string.Empty;
            //         act.AcceptChanges();
            //     }
            //
            //     Link.Name = value;
            // }
        }
    }

    internal void DetachSourceLink()
    {
        if (Link != null)
        {
            Link.DiagramConnection = null;
        }
        else
        {
            _preSource = null;
            _preSourceLink = null;
        }
    }

    protected override void OnRemoveFromSurface()
    {
        if (Source != null && Target != null)
        {
            Link?.Target = null;
        }

        if (Source != null)
        {
            Link?.DiagramConnection = null;
            Link = null;
        }
        else
        {
            _preSource = null;
            _preSourceLink = null;
        }

        base.OnRemoveFromSurface();
        Invalidate();
    }

    protected override void OnSourceChanged(IShape? oldSource)
    {
        base.OnSourceChanged(oldSource);

        if (_isLoading)
            return;

        var oldSourceModel = oldSource == null ? null : ((ActivityDesigner)oldSource).Node;
        var newSourceModel = Source == null ? null : ((ActivityDesigner)Source).Node;
        //注意：不可能存在 non null -> non null，设计器拖动首尾点时自动清空
        if (oldSourceModel == null && newSourceModel != null) //null -> non null
        {
            //todo:对话框选择可供输出的连接名称，如HumanAction或Decision有多个输出
            var availableConnections = newSourceModel.GetAvailableOutLinks().ToArray();
            if (availableConnections.Length == 0)
                throw new NotSupportedException("No available out links."); //this.Source = null;//暂简单改回去

            //互设引用
            if (_preSourceLink != null)
            {
                if (Source == _preSource) //还是相同的源，只不过连接到不同的Connector
                    Link = _preSourceLink;

                _preSource = null;
                _preSourceLink = null;
            }

            if (Link == null)
                Link = availableConnections[0];
            Link.DiagramConnection = this;

            //再判断目标有没有
            if (Target != null)
            {
                ActivityNode targetNode = ((ActivityDesigner)Target).Node;
                Link.SourceConnector = string.IsNullOrEmpty(SourceConnectorPosition)
                    ? FlowLink.Connector.Auto
                    : Enum.Parse<FlowLink.Connector>(SourceConnectorPosition);
                Link.TargetConnector = string.IsNullOrEmpty(TargetConnectorPosition)
                    ? FlowLink.Connector.Auto
                    : Enum.Parse<FlowLink.Connector>(TargetConnectorPosition);
                Link.Target = targetNode;
            }
        }
        else if (oldSourceModel != null && newSourceModel == null) //non null -> null
        {
            _preSourceLink = Link;
            _preSource = oldSource;

            Link.Target = null;
            Link.DiagramConnection = null; //互相清空引用
            Link = null;
        }
    }

    protected override void OnTargetChanged(IShape? oldTarget)
    {
        base.OnTargetChanged(oldTarget);

        if (_isLoading)
            return;

        if (Source != null)
        {
            // var sourceNode = ((ActivityDesigner)Source).Node;
            var oldTargetNode = oldTarget == null ? null : ((ActivityDesigner)oldTarget).Node;
            var newTargetNode = Target == null ? null : ((ActivityDesigner)Target).Node;

            //注意：不可能存在 non null -> non null，设计器拖动首尾点时自动清空
            if (oldTargetNode == null && newTargetNode != null) //null -> non null
            {
                Link.SourceConnector = string.IsNullOrEmpty(SourceConnectorPosition)
                    ? FlowLink.Connector.Auto
                    : Enum.Parse<FlowLink.Connector>(SourceConnectorPosition);
                Link.TargetConnector = string.IsNullOrEmpty(TargetConnectorPosition)
                    ? FlowLink.Connector.Auto
                    : Enum.Parse<FlowLink.Connector>(TargetConnectorPosition);
                Link.Target = newTargetNode;
            }
            else if (oldTargetNode != null && newTargetNode == null) //non null -> null
            {
                Link.Target = null;
            }
        }
    }

    protected override void OnSourceConnectorPositionChanged(string? newPosition, string? oldPosition)
    {
        base.OnSourceConnectorPositionChanged(newPosition, oldPosition);

        if (_isLoading)
            return;

        Link?.SourceConnector = string.IsNullOrEmpty(newPosition)
            ? FlowLink.Connector.Auto
            : Enum.Parse<FlowLink.Connector>(newPosition);
    }

    protected override void OnTargetConnectorPositionChanged(string? newPosition, string? oldPosition)
    {
        base.OnTargetConnectorPositionChanged(newPosition, oldPosition);

        if (_isLoading)
            return;

        Link?.TargetConnector = string.IsNullOrEmpty(newPosition)
            ? FlowLink.Connector.Auto
            : Enum.Parse<FlowLink.Connector>(newPosition);
    }
}