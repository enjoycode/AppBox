abstract class TestMethodArgs
{
    TestMethodArgs(int? num = null) {}
    
    public void TestDefaultValue(int num = 10) {}

    public abstract void AbstractWithDefaultValue(int? num = null);
}