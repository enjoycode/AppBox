using System.Collections.Generic;

class Row : PixUI.MultiChildWidget
{
    public Row(string name) {}
}

class Person
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
    
    public Person() {}

    public void Test()
    {
        var p1 = new Person() { Name = "Rick", Age = 100 };
        var p2 = new Person()
        {
            Name = "Eric",
            Age = 100
        };
        var list = new List<int>() { 1, 2, 3 };
        Person[] array = new[] { new Person(), new Person() };

        var container = new Row ("Hello")
        {
            1,2,3
        };
    }
}