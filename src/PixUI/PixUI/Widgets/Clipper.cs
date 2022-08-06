using System;

namespace PixUI
{
    public interface IClipper : IDisposable
    {
        void ApplyToCanvas(Canvas canvas);
        
        bool IsEmpty { get; }

        void Offset(float dx, float dy);

        Path GetPath();

        Rect GetRect();

        IClipper IntersectWith(IClipper to);
    }

    public sealed class ClipperOfRect : IClipper
    {
        public ClipperOfRect(Rect rect, bool antiAlias = false)
        {
            _area = rect;
            _antiAlias = antiAlias;
        }
        
        private Rect _area;
        private readonly bool _antiAlias;
        
        public void Dispose() { }

        public void ApplyToCanvas(Canvas canvas) =>
            canvas.ClipRect(_area, ClipOp.Intersect, _antiAlias);

        public bool IsEmpty => _area.IsEmpty;
        public void Offset(float dx, float dy) => _area.Offset(dx, dy);

        public Rect GetRect() => _area;
        
        public Path GetPath() => throw new NotSupportedException();

        public IClipper IntersectWith(IClipper to)
        {
            if (to is ClipperOfRect)
            {
                _area.Intersect(to.GetRect());
                return this;
            }
            if (to is ClipperOfPath)
            {
                return to.IntersectWith(this);
            }

            throw new NotSupportedException();
        }
    }

    public sealed class ClipperOfPath : IClipper
    {
        public ClipperOfPath(Path path, bool antiAlias = true)
        {
            _area = path;
            _antiAlias = antiAlias;
        }
        
        private readonly Path _area;
        private readonly bool _antiAlias;

        public void Dispose() => _area.Dispose();

        public void ApplyToCanvas(Canvas canvas) =>
            canvas.ClipPath(_area, ClipOp.Intersect, _antiAlias);

        public bool IsEmpty => _area.IsEmpty();

        public void Offset(float dx, float dy) => _area.Offset(dx, dy);

        public Path GetPath() => _area;

        public Rect GetRect() => throw new NotSupportedException();

        public IClipper IntersectWith(IClipper to)
        {
            if (to is ClipperOfRect)
            {
                using var other = new Path();
                other.AddRect(to.GetRect());
                _area.Op(other, PathOp.Intersect);
                return this;
            }

            if (to is ClipperOfPath)
            {
                _area.Op(to.GetPath(), PathOp.Intersect);
                to.Dispose();
                return this;
            }

            throw new NotSupportedException();
        }
    }
}