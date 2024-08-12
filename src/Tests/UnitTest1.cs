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
        
        Console.WriteLine(DateTime.MaxValue.ToLocalTime().ToString("yyyy-MM-dd hh:mm:ss"));
        
        Assert.Pass();
    }
}