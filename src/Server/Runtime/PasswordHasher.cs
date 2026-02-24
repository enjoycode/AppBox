using System.Security.Cryptography;
using AppBoxCore;

namespace AppBoxServer;

/// <summary>
/// 默认的密码Hasher
/// </summary>
internal sealed class PasswordHasher : IPasswordHasher
{
    private const int ITERATIONS = 1000;
    private const int SALT_SIZE = 16;
    private const int KEY_SIZE = 32;

    public byte[] HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentNullException(nameof(password));

        var salt = new byte[SALT_SIZE];
        RandomNumberGenerator.Fill(salt.AsSpan(0, SALT_SIZE));
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, ITERATIONS, HashAlgorithmName.SHA1, KEY_SIZE);

        var result = new byte[49];
        Buffer.BlockCopy(salt, 0, result, 1, SALT_SIZE);
        Buffer.BlockCopy(key, 0, result, 17, KEY_SIZE);
        return result;
    }

    public bool VerifyHashedPassword(byte[]? hashedPassword, string password)
    {
        if (hashedPassword == null || hashedPassword.Length != 49 || hashedPassword[0] != 0)
            return false;
        if (string.IsNullOrEmpty(password))
            throw new ArgumentNullException(nameof(password));

        var key = Rfc2898DeriveBytes.Pbkdf2(password.AsSpan(), hashedPassword.AsSpan(1, SALT_SIZE), ITERATIONS,
            HashAlgorithmName.SHA1, KEY_SIZE);
        return key.AsSpan().SequenceEqual(hashedPassword.AsSpan(17));
    }
}