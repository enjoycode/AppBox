class DemoClass
{
    void Params(params int[] args) { }
    
    void CallWithRefArg(ref int arg)
    {
        arg++;
        arg = 32;
    }

    void Test()
    {
        int v = 3;
        CallWithRefArg(ref v);
    }
}