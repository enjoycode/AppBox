using AppBoxCore;
using PixUI.Diagram;

namespace AppBoxDesign;

/// <summary>
/// 用于工作流设计器的连接线，监测Source及Target的改变，修改相应的模型的流转
/// </summary>
internal sealed class ActivityConnection : DiagramConnection
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
        _sourceLink = link;
        _sourceLink.SourceConnection = this;
        SourceConnectorPosition = link.SourceConnector;
        Source = source;
        TargetConnectorPosition = link.TargetConnector;
        Target = target;
        _isLoading = false;
    }

    private FlowLink? _preSourceLink; //todo:临时方案用于解决移动已连接源至相同的源但Connector不同
    private IShape? _preSource; //同上组合

    private FlowLink? _sourceLink;
    private bool _isLoading;

    public FlowLink? Link => _sourceLink;

    public override string? Title
    {
        get => _sourceLink?.Name;
        set
        {
            throw new NotSupportedException(); //暂不支持修改
            // if (_sourceLink != null)
            // {
            //     //暂直接修改单人活动的连接名称所对应的Action.Name
            //     var designer = (ActivityDesigner)Source!;
            //     if (designer.Model is SingleHumanActivityModel singleHumanActivityModel)
            //     {
            //         var act = singleHumanActivityModel.Actions.Single(t => t.Name == _sourceLink.Name);
            //         act.Name = value ?? string.Empty;
            //         act.AcceptChanges();
            //     }
            //
            //     _sourceLink.Name = value;
            // }
        }
    }

    internal void DetachSourceLink()
    {
        if (_sourceLink != null)
        {
            _sourceLink.SourceConnection = null;
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
            _sourceLink?.Target = null;
        }

        if (Source != null)
        {
            _sourceLink?.SourceConnection = null;
            _sourceLink = null;
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
                    _sourceLink = _preSourceLink;

                _preSource = null;
                _preSourceLink = null;
            }

            if (_sourceLink == null)
                _sourceLink = availableConnections[0];
            _sourceLink.SourceConnection = this;

            //再判断目标有没有
            if (Target != null)
            {
                ActivityNode targetNode = ((ActivityDesigner)Target).Node;
                _sourceLink.SourceConnector = SourceConnectorPosition;
                _sourceLink.TargetConnector = TargetConnectorPosition;
                _sourceLink.Target = targetNode;
            }
        }
        else if (oldSourceModel != null && newSourceModel == null) //non null -> null
        {
            _preSourceLink = _sourceLink;
            _preSource = oldSource;

            _sourceLink.Target = null;
            _sourceLink.SourceConnection = null; //互相清空引用
            _sourceLink = null;
        }
    }

    protected override void OnTargetChanged(IShape? oldTarget)
    {
        base.OnTargetChanged(oldTarget);

        if (_isLoading)
            return;

        if (Source != null)
        {
            var sourceModel = ((ActivityDesigner)Source).Node;
            var oldTargetModel = oldTarget == null ? null : ((ActivityDesigner)oldTarget).Node;
            var newTargetModel = Target == null ? null : ((ActivityDesigner)Target).Node;

            //注意：不可能存在 non null -> non null，设计器拖动首尾点时自动清空
            if (oldTargetModel == null && newTargetModel != null) //null -> non null
            {
                _sourceLink.SourceConnector = SourceConnectorPosition;
                _sourceLink.TargetConnector = TargetConnectorPosition;
                _sourceLink.Target = newTargetModel;
            }
            else if (oldTargetModel != null && newTargetModel == null) //non null -> null
            {
                _sourceLink.Target = null;
            }
        }
    }

    protected override void OnSourceConnectorPositionChanged(string? newPosition, string? oldPosition)
    {
        base.OnSourceConnectorPositionChanged(newPosition, oldPosition);

        if (_isLoading)
            return;

        if (_sourceLink != null)
            _sourceLink.SourceConnector = newPosition;
    }

    protected override void OnTargetConnectorPositionChanged(string? newPosition, string? oldPosition)
    {
        base.OnTargetConnectorPositionChanged(newPosition, oldPosition);

        if (_isLoading)
            return;

        if (_sourceLink != null)
            _sourceLink.TargetConnector = newPosition;
    }
}