using AppBoxDesign;
using NUnit.Framework;

namespace Tests;

public abstract class DesignContextTestBase
{
    protected DesignContext DesignContext { get; private set; } = null!;

    [OneTimeSetUp]
    public async Task OneTimeSetup()
    {
        DesignContext = await DesignHelper.MockDesignContext();
    }
}