#if !__WEB__
using System;
using System.Runtime.InteropServices;
using CodeEditor;

namespace CodeEditor
{
    internal sealed class ParserInput : IDisposable
    {
        private readonly ITextBuffer _textBuffer;
        private readonly IntPtr _nativeBuffer;
        private const int NativeInputSize = 2048;

        internal ParserInput(ITextBuffer textBuffer)
        {
            _textBuffer = textBuffer;
            _nativeBuffer = Marshal.AllocHGlobal(NativeInputSize);
        }

        internal static IntPtr Read(IntPtr payload, uint byteIndex, TSPoint position,
            out uint bytesRead)
        {
            Console.WriteLine($"Parse read: {byteIndex}");
            var gcHandle = GCHandle.FromIntPtr(payload);
            var input = (ParserInput)gcHandle.Target;

            var offset = (int)(byteIndex / SyntaxParser.ParserEncoding); //utf16
            if (offset >= input._textBuffer.Length)
            {
                bytesRead = 0;
                return IntPtr.Zero;
            }

            //TODO: 优化避免复制，暂简单实现
            var count = Math.Min(NativeInputSize / 2, input._textBuffer.Length - offset);
            unsafe
            {
                var dest = new Span<char>(input._nativeBuffer.ToPointer(), NativeInputSize / 2);
                input._textBuffer.CopyTo(dest, offset, count);
            }

            bytesRead = (uint)count * SyntaxParser.ParserEncoding;
            return input._nativeBuffer;
        }

        public void Dispose()
        {
            Marshal.FreeHGlobal(_nativeBuffer);
        }
    }
}
#endif