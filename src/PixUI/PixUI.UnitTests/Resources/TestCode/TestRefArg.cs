class DemoClass
{
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