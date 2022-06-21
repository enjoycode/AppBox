using System;
using NUnit.Framework;

namespace Tests;

public class Tests
{
    [SetUp]
    public void Setup() { }

    [Test]
    public void Test1()
    {
        var utc = DateTime.UnixEpoch;
        var ticks = utc.Ticks;
        
        Assert.Pass();
    }
}