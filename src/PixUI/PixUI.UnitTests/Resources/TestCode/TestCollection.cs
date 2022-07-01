using System.Collections.Generic;

class TestClass
{
    void Test()
    {
        var list1 = new List<int>();
        IList<int> list2 = list1;
        var count1 = list1.Count;
        var count2 = list2.Count;
    }
}