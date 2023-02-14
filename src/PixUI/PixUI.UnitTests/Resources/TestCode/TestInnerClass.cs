public class OuterClass
{
    
    private class InnerClass
    {
        public void SayHello() {}
    }

    public void Test()
    {
        var c = new InnerClass();
        c.SayHello();
    }
    
}