using System;
using AppBoxCore;
using AppBoxDesign;

namespace Tests;

public sealed class MockSession : IDeveloperSession
{
    private readonly DesignHub _designHub;

    public string Name { get; } = string.Empty;
    public bool IsExternal => false;
    public string Tag => string.Empty;
    public string SessionId { get; }

    public int Levels { get; } = 0;
    public Guid LeafOrgUnitId { get; } = Guid.Empty;
    public Guid EmployeeId { get; } = Guid.Empty;
    public Guid ExternalId { get; } = Guid.Empty;

    public TreePathNode this[int index] => throw new NotImplementedException();

    public MockSession(string sessionId)
    {
        SessionId = sessionId;
        _designHub = new DesignHub(this);
    }

    public DesignHub GetDesignHub() => _designHub;
}