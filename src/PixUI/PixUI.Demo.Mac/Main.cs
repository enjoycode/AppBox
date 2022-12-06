using System.Collections.Generic;
using PixUI.Platform.Mac;

namespace PixUI.Demo.Mac
{
    internal static class MainClass
    {
        private static void Main(string[] args)
        {
            var root = new DemoRoute();
            MacApplication.Run(root);
        }
    }
}