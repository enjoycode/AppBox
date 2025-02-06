using Microsoft.CodeAnalysis.Text;
using NUnit.Framework;

namespace Tests.Design.Roslyn;

public class SourceTextTest
{
    [Test]
    public void ChangeTest()
    {
        var sourceText = SourceText.From(string.Empty);
        var sourceText1 = sourceText.Replace(0, 0, "Hello World");
        var sourceText2 = sourceText.Replace(0, 0, "Hello Future");
    }
}