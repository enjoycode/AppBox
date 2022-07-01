using System;

class Resource : IDisposable
{
    public void Dispose() {}

    public static void Test(bool condition)
    {
        using var res1 = new Resource();
        if (condition)
        {
            using var res2 = new Resource();
            Console.Write(res2);
        }
        Console.Write(res1);
    }
}