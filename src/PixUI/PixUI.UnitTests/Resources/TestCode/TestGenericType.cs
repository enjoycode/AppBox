public class Function {}

public class Function<T1> {}

public class Function<T1, T2> {}

public class TestClass
{

    public void Test()
    {
        Function<string> func1 = new();
        var func2 = new Function<string, int>();
    }
    
}