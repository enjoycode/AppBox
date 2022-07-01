using System;

interface IFactory { }

class Map<T1, T2> where T2: class, IDisposable, IFactory
{
    public void Add(T1 key, T2 value) {}

    public void GenericMethod<R>(R item) where R : IDisposable
    {
        item.Dispose();
    }
    
    public void Method2(Map<string, T2> map) {}
}