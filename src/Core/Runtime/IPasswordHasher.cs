namespace AppBoxCore;

public interface IPasswordHasher
{
    byte[] HashPassword(string password);
    bool VerifyHashedPassword(byte[]? hashedPassword, string password);
}