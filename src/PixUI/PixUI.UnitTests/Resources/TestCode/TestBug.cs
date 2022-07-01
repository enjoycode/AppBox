// class BugOfIndexer
// {
//     private string a = "aa";
//     public string this[int index]
//     {
//         get => a;
//         set => a = value;
//     }
// }

// class Point
// {
//     public readonly int X;
//     public readonly int Y;
//
//     public string a = null!;
//
//     public string? Name = null;
// }

// class BugOfBinaryExpression
// {
//     void Test(Point? point)
//     {
//         var x = 32 + point?.X ?? 0;
//         var y = 32 + point == null ? 0 : point.Y;
//     }
// }

// class BugOfAssignment
// {
//     void Test(Point pt)
//     {
//         var n = pt.Name!;
//     }
// }

using PixUI;

interface IDirtyArea
{
    IDirtyArea ToChild();
}

class BugOfDelegateBind
{
    void Paint(IDirtyArea area) { }
    
    void Test(IDirtyArea? area)
    {
        Paint(area?.ToChild());
    }
}
