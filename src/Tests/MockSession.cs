using System;
using AppBoxCore;
using AppBoxDesign;

namespace Tests;

public sealed class MockSession : IDeveloperSession
{
    public string Name { get; } = "MockUser";
    public bool IsExternal => false;
    public string Tag => string.Empty;
    public string SessionId { get; }

    public int Levels { get; } = 0;
    public Guid LeafOrgUnitId { get; } = Guid.Parse("23ac9096-e0dd-456d-a14d-87c085c947e9");
    public Guid EmployeeId { get; } = Guid.Empty;
    public Guid ExternalId { get; } = Guid.Empty;

    public TreePathNode this[int index] => throw new NotImplementedException();

    public MockSession(string sessionId)
    {
        SessionId = sessionId;
    }
}