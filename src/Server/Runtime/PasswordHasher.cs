using System;
using System.Security.Cryptography;
using AppBoxCore;

namespace AppBoxServer;

/// <summary>
/// 默认的密码Hasher
/// </summary>
internal sealed class PasswordHasher : IPasswordHasher
{
    public byte[] HashPassword(string password)
    {
        if (password == null)
            throw new ArgumentNullException(nameof(password));
        byte[] salt;
        byte[] bytes;
        using (var rfc2898DeriveBytes = new Rfc2898DeriveBytes(password, 16, 1000))
        {
            salt = rfc2898DeriveBytes.Salt;
            bytes = rfc2898DeriveBytes.GetBytes(32);
        }
        var inArray = new byte[49];
        Buffer.BlockCopy(salt, 0, inArray, 1, 16);
        Buffer.BlockCopy(bytes, 0, inArray, 17, 32);
        return inArray;
    }

    public bool VerifyHashedPassword(byte[]? hashedPassword, string password)
    {
        if (hashedPassword == null)
            return false;
        if (password == null)
            throw new ArgumentNullException(nameof(password));

        if (hashedPassword.Length != 49 || (int)hashedPassword[0] != 0)
            return false;
        var salt = new byte[16];
        Buffer.BlockCopy(hashedPassword, 1, salt, 0, 16);
        var a = new byte[32];
        Buffer.BlockCopy(hashedPassword, 17, a, 0, 32);
        byte[] bytes;
        using (var rfc2898DeriveBytes = new Rfc2898DeriveBytes(password, salt, 1000))
            bytes = rfc2898DeriveBytes.GetBytes(32);

        return a.AsSpan().SequenceEqual(bytes);
    }
}