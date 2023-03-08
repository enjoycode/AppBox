using System;
using System.Linq;

class TestClass
{
    void Test()
    {
        var ar = new[] { 1, 2, 3 };
        var list = ar.Select(i =>
        {
            var name = "Rick";
            return new
            {
                name,
                index = i
            };
        })
            .OrderBy(t => t.index);
        Console.WriteLine(list.First().name);
    }
}