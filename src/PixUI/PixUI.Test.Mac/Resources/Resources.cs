using System.IO;
using System.Reflection;

namespace PixUI.Test.Mac
{
    internal static class Resources
    {
        private static readonly Assembly ResAssembly = typeof(Resources).Assembly;

        public static Stream LoadStream(string res)
        {
            return ResAssembly.GetManifestResourceStream("PixUI.Test.Mac." + res)!;
        }

        public static byte[] LoadBytes(string res)
        {
            using var stream = LoadStream(res);
            var data = new byte[stream.Length];
            stream.Read(data, 0, data.Length);
            return data;
        }
    }
}