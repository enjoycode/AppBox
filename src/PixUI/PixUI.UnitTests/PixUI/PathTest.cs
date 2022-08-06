using NUnit.Framework;

namespace PixUI.UnitTests
{
    public class PathTest
    {
        [Test]
        public void OpIntersectTest1()
        {
            var bigger = Rect.FromLTWH(10, 10, 200, 200);
            var smaller = Rect.FromLTWH(20, 20, 50, 50);
            var pathBigger = new Path();
            pathBigger.AddRect(bigger);
            var pathSmaller = new Path();
            pathSmaller.AddRect(smaller);

            var res = pathBigger.Op(pathSmaller, PathOp.Intersect);
            Assert.True(res);
            Assert.True(pathBigger.IsRect);
            var rect = pathBigger.GetRect();
            Assert.True(rect == smaller);
        }

        [Test]
        public void OpIntersectTest2()
        {
            var rect1 = Rect.FromLTWH(0, 0, 10, 10);
            var rect2 = Rect.FromLTWH(30, 30, 10, 10);
            var path1 = new Path();
            path1.AddRect(rect1);
            var path2 = new Path();
            path2.AddRect(rect2);

            var res = path1.Op(path2, PathOp.Intersect);
            Assert.True(res);
            Assert.True(path1.IsEmpty());
        }
    }
}