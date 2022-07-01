using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace PixUI.Platform
{
    public static class AssetLoader
    {
        private static readonly Dictionary<string, Assembly> AsmCaches = new ();

        public static Stream? LoadAsStream(string assemblyName, string path)
        {
            Assembly? asm;
            lock (AsmCaches)
            {
                if (!AsmCaches.TryGetValue(assemblyName, out asm))
                {
                    asm = AppDomain.CurrentDomain.GetAssemblies()
                        .FirstOrDefault(t => t.GetName().Name == assemblyName);
                    if (asm != null)
                        AsmCaches.Add(assemblyName, asm);
                }
            }

            if (asm == null) return null;

            return asm.GetManifestResourceStream($"{assemblyName}.Assets.{path}");
        }
    }
}