namespace AppBoxCore;

public enum MessageType : byte
{
    Event = 3,
        
    LoginRequest = 5,
    LoginResponse = 6,
        
    InvokeRequest = 10,
    InvokeResponse = 11,
}