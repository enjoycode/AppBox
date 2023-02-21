using System.Threading.Tasks;

class TestClass
{

    void TestWhenAny()
    {
        var tasks = new Task[] { Task.CompletedTask};
        Task.WhenAny(tasks);
        Task.WhenAny(Task.CompletedTask);
        Task.WhenAny(Task.CompletedTask, Task.CompletedTask);
    }

    async void TestDelay()
    {
        await Task.Delay(1000);
    }
    
}