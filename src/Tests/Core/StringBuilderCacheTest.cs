using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public class StringBuilderCacheTest
{
    [Test]
    public void IsSameInstance()
    {
        var sb1 = StringBuilderCache.Acquire();
        sb1.Append('A');
        var s1 = StringBuilderCache.GetStringAndRelease(sb1);

        var sb2 = StringBuilderCache.Acquire();
        sb2.Append('B');
        var s2 = StringBuilderCache.GetStringAndRelease(sb2);
        
        Assert.True(ReferenceEquals(sb1, sb2));
        Assert.True(s1 == "A");
        Assert.True(s2 == "B");
    }
}