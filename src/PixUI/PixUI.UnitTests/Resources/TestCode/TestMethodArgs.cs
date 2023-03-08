abstract class TestMethodArgs
{
    TestMethodArgs(int? num = null) {}
    
    public void TestDefaultValue(int num = 10) {}

    public abstract void AbstractWithDefaultValue(int? num = null);
    
    public void ParamsArgs1(params int[] args) { }
    
    public void ParamsArgs2(params string[] args) {}
    
    public void ParamsArgs3(params int[]? args) {}

    public void TestParamsArgs()
    {
        var args1 = new string[] { "a", "b" };
        ParamsArgs2(args1); //ParamsArgs2(...args);

        var args2 = new int[] { 1, 2 };
        ParamsArgs1(args2); //ParamsArgs1(...args2.ToArray())

        ParamsArgs3(null);
    }
    
    public void RefArg(ref int arg)
    {
        arg++;
        arg = 32;
    }

    public void TestRefArg()
    {
        int v = 3;
        RefArg(ref v);
    }
}