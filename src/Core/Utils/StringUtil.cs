using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace AppBoxCore.Utils;

public static class StringUtil
{
    const string alphabet = @"0123456789ABCDEF";

    /// <summary>
    /// 获取字符串HashCode，用以消除平台实现的差异性
    /// </summary>
    public static unsafe int GetHashCode(string value)
    {
        //fixed (char* str = value)
        //{
        //    char* chPtr = str;
        //    int num = 0x15051505;
        //    int num2 = num;
        //    int* numPtr = (int*)chPtr;
        //    for (int i = s.Length; i > 0; i -= 4)
        //    {
        //        num = (((num << 5) + num) + (num >> 0x1b)) ^ numPtr[0];
        //        if (i <= 2)
        //        {
        //            break;
        //        }
        //        num2 = (((num2 << 5) + num2) + (num2 >> 0x1b)) ^ numPtr[1];
        //        numPtr += 2;
        //    }
        //    return (num + (num2 * 0x5d588b65));
        //}

        int hash1 = 5381;
        int hash2 = hash1;
        unsafe
        {
            fixed (char* src = value)
            {
                int c;
                char* s = src;
                while ((c = s[0]) != 0)
                {
                    hash1 = ((hash1 << 5) + hash1) ^ c;
                    c = s[1];
                    if (c == 0)
                        break;
                    hash2 = ((hash2 << 5) + hash2) ^ c;
                    s += 2;
                }
            }
        }

        return hash1 + (hash2 * 1566083941);
    }

    /// <summary>
    /// 将字符串以UTF-8编码方式写入流内
    /// </summary>
    public static unsafe void WriteTo(string s, Action<byte> writer)
    {
        fixed (char* chars = s)
        {
            var pos = 0;
            var surrogateChar = -1;
            var strLength = s.Length;
            while (pos < strLength)
            {
                char c = chars[pos++];
                if (surrogateChar > 0)
                {
                    if (IsLowSurrogate(c))
                    {
                        surrogateChar = (surrogateChar - 0xd800) << 10;
                        surrogateChar += c - 0xdc00;
                        surrogateChar += 0x10000;
                        writer((byte)(240 | ((surrogateChar >> 0x12) & 7)));
                        writer((byte)(0x80 | ((surrogateChar >> 12) & 0x3f)));
                        writer((byte)(0x80 | ((surrogateChar >> 6) & 0x3f)));
                        writer((byte)(0x80 | (surrogateChar & 0x3f)));
                        surrogateChar = -1;
                    }
                    else if (IsHighSurrogate(c))
                    {
                        EncodeThreeBytes(0xfffd, writer);
                        surrogateChar = c;
                    }
                    else
                    {
                        EncodeThreeBytes(0xfffd, writer);
                        surrogateChar = -1;
                        pos--;
                    }
                }
                else if (c < '\x0080')
                {
                    writer((byte)c);
                }
                else
                {
                    if (c < 'ࠀ')
                    {
                        writer((byte)(0xc0 | ((c >> 6) & '\x001f')));
                        writer((byte)(0x80 | (c & '?')));
                        continue;
                    }

                    if (IsHighSurrogate(c))
                    {
                        surrogateChar = c;
                        continue;
                    }

                    if (IsLowSurrogate(c))
                    {
                        EncodeThreeBytes(0xfffd, writer);
                        continue;
                    }

                    writer((byte)(0xe0 | ((c >> 12) & '\x000f')));
                    writer((byte)(0x80 | ((c >> 6) & '?')));
                    writer((byte)(0x80 | (c & '?')));
                }
            }

            if (surrogateChar > 0)
            {
                EncodeThreeBytes(0xfffd, writer);
            }
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    internal static bool IsLowSurrogate(char c)
    {
        return ((c >= 0xdc00) && (c <= 0xdfff));
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    internal static bool IsHighSurrogate(char c)
    {
        return ((c >= 0xd800) && (c <= 0xdbff));
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static void EncodeThreeBytes(int ch, Action<byte> writer)
    {
        writer((byte)(0xe0 | ((ch >> 12) & 15)));
        writer((byte)(0x80 | ((ch >> 6) & 0x3f)));
        writer((byte)(0x80 | (ch & 0x3f)));
    }

    /// <summary>
    /// 读取UTF-8编码的字符串
    /// </summary>
    /// <returns>The from stream.</returns>
    public static string ReadFrom(int chars, Func<byte> reader)
    {
        Debug.Assert(chars > 0);
        return string.Create(chars, reader, (span, readByte) =>
        {
            var dp = 0;
            int b1, b2, b3, b4;

            while (dp < chars)
            {
                b1 = readByte();
                if ((b1 & 0x80) == 0) // 1 byte, 7 bits: 0xxxxxxx
                {
                    span[dp++] = (char)b1;
                }
                else if ((b1 & 0xE0) == 0xC0) // 2 bytes
                {
                    b2 = readByte() & 0x3F;
                    span[dp++] = (char)(((b1 & 0x1F) << 6) | b2);
                }
                else if ((b1 & 0xF0) == 0xE0) // 3 bytes
                {
                    b2 = readByte() & 0x3F;
                    b3 = readByte() & 0x3F;
                    span[dp++] = (char)(((b1 & 0x1F) << 12) | (b2 << 6) | b3);
                }
                else if ((b1 & 0xF8) == 0xF0) // 4 bytes
                {
                    b2 = readByte() & 0x3F;
                    b3 = readByte() & 0x3F;
                    b4 = readByte() & 0x3F;
                    var unit = ((b1 & 0x07) << 0x12) | (b2 << 0x0C) | (b3 << 0x06) | b4;
                    if (unit > 0xFFFF)
                    {
                        unit -= 0x10000;
                        span[dp++] = (char)(((unit >> 10) & 0x3FF) | 0xD800);
                        unit = 0xDC00 | (unit & 0x3FF);
                    }

                    span[dp++] = (char)unit;
                }
                else
                {
                    throw new Exception("Utf8 encode error");
                }
            }
        });
    }

    [System.Diagnostics.Contracts.Pure]
    public static unsafe string ToHexString(byte[] bytes)
    {
        if (bytes == null || bytes.Length == 0)
            return null;

        string result = new string(' ', checked(bytes.Length * 2));
        fixed (char* alphabetPtr = alphabet)
        fixed (char* resultPtr = result)
        {
            char* ptr = resultPtr;
            unchecked
            {
                for (int i = 0; i < bytes.Length; i++)
                {
                    *ptr++ = *(alphabetPtr + (bytes[i] >> 4));
                    *ptr++ = *(alphabetPtr + (bytes[i] & 0xF));
                }
            }
        }

        return result;
    }

    public static unsafe string ToHexString(IntPtr bytePtr, int size)
    {
        if (bytePtr == IntPtr.Zero)
            throw new ArgumentNullException(nameof(bytePtr));
        if (size <= 0)
            return null;

        byte* bytes = (byte*)bytePtr.ToPointer();

        string result = new string(' ', checked(size * 2));
        fixed (char* alphabetPtr = alphabet)
        fixed (char* resultPtr = result)
        {
            char* ptr = resultPtr;
            unchecked
            {
                for (int i = 0; i < size; i++)
                {
                    *ptr++ = *(alphabetPtr + (bytes[i] >> 4));
                    *ptr++ = *(alphabetPtr + (bytes[i] & 0xF));
                }
            }
        }

        return result;
    }

    [System.Diagnostics.Contracts.Pure]
    public static unsafe byte[] FromHexString(string value)
    {
        if (string.IsNullOrEmpty(value))
            return null;
        if (value.Length % 2 != 0)
            throw new ArgumentException("Hexadecimal value length must be even.", nameof(value));

        unchecked
        {
            byte[] result = new byte[value.Length / 2];
            fixed (char* valuePtr = value)
            {
                char* valPtr = valuePtr;
                for (int i = 0; i < result.Length; i++)
                {
                    // 0(48) - 9(57) -> 0 - 9
                    // A(65) - F(70) -> 10 - 15
                    int b = *valPtr++; // High 4 bits.
                    int val = ((b - '0') + ((('9' - b) >> 31) & -7)) << 4;
                    b = *valPtr++; // Low 4 bits.
                    val += (b - '0') + ((('9' - b) >> 31) & -7);
                    result[i] = checked((byte)val);
                }
            }

            return result;
        }
    }
}