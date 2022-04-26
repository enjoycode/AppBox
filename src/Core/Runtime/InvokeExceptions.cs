namespace AppBoxCore;

public sealed class ServiceNotExistsException : Exception
{
    public ServiceNotExistsException(string message) : base(message) { }
}

public sealed class ServicePathException : Exception
{
    public ServicePathException(string message) : base(message) { }
}