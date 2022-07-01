namespace PixUI
{
    public abstract class Cursor
    {
        public static IPlatformCursors PlatformCursors = null!;

        public static Cursor Current
        {
            set => PlatformCursors.SetCursor(value);
        }
    }

    public static class Cursors
    {
        public static Cursor Arrow => Cursor.PlatformCursors.Arrow;

        public static Cursor Hand => Cursor.PlatformCursors.Hand;

        public static Cursor IBeam => Cursor.PlatformCursors.IBeam;

        public static Cursor ResizeLR => Cursor.PlatformCursors.ResizeLR;

        public static Cursor ResizeUD => Cursor.PlatformCursors.ResizeUD;
    }

    public interface IPlatformCursors
    {
        public Cursor Arrow { get; }

        public Cursor Hand { get; }

        public Cursor IBeam { get; }

        public Cursor ResizeLR { get; }

        public Cursor ResizeUD { get; }

        public void SetCursor(Cursor cursor);
    }
}