namespace AppBoxCore;

public enum MessageType : byte
{
    ServerEvent = 3,
        
    LoginRequest = 5,
    LoginResponse = 6,
        
    InvokeRequest = 10,
    InvokeResponse = 11,
    
    UploadRequest = 20,
    UploadChunk = 21,
    UploadResponse = 22,
    
    DownloadRequest = 23,
    DownloadChunk = 24,
    DownloadResponse = 25,
}