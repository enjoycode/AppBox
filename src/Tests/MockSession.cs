using System;
using AppBoxCore;
using AppBoxDesign;

namespace Tests;

public sealed class MockSession : IDeveloperSession
{
    private int _sessionId;
    private DesignHub _designHub;
    
    public string Name { get; }
    public bool IsExternal { get; }
    public string Tag { get; }
    public int SessionId => _sessionId;
    public int Levels { get; }
    public Guid LeafOrgUnitId { get; }
    public Guid EmploeeId { get; }
    public Guid ExternalId { get; }

    public TreePathNode this[int index] => throw new NotImplementedException();

    public MockSession(int sessionId)
    {
        _sessionId = sessionId;
        _designHub = new DesignHub(this);
    }

    public DesignHub GetDesignHub() => _designHub;

}