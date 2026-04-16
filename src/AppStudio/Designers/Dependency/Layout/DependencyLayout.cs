using System.Diagnostics;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign.Dependency;

internal static class DependencyLayout
{
    public static void Layout(DependencyItem target, IList<DependencyItem> usages, Point center)
    {
        target.Location = new Point(center.X - target.Bounds.Width / 2, center.Y - target.Bounds.Height / 2);
        if (usages.Count == 0)
            return;

        var groups = new List<DependencyGroup>();
        //EntityGroup
        var entities = usages.Where(u => u.ModelNode.ModelType == ModelType.Entity).ToArray();
        if (entities.Length > 0)
            groups.Add(new DependencyGroup(entities, DependencyGroup.GroupPosition.Top));
        //ServiceGroup
        var services = usages.Where(u => u.ModelNode.ModelType == ModelType.Service).ToArray();
        if (services.Length > 0)
            groups.Add(new DependencyGroup(services, DependencyGroup.GroupPosition.Bottom));
        //ViewGroup
        var views = usages.Where(u => u.ModelNode.ModelType == ModelType.View).ToArray();
        if (views.Length > 0)
            groups.Add(new DependencyGroup(views, DependencyGroup.GroupPosition.Right));
        //OtherGroup
        var others = usages.Where(u => u.ModelNode.ModelType is ModelType.Enum or ModelType.Permission).ToArray();
        if (others.Length > 0)
            groups.Add(new DependencyGroup(others, DependencyGroup.GroupPosition.Left));

        LayoutGroups(target, groups);

        //再次居中至视图
        var left = Math.Min(usages.Min(u => u.Location.X), target.Location.X);
        var top = Math.Min(usages.Min(u => u.Location.Y), target.Location.Y);
        var right = Math.Max(usages.Max(u => u.Bounds.Right), target.Bounds.Right);
        var bottom = Math.Max(usages.Max(u => u.Bounds.Bottom), target.Bounds.Bottom);
        var allBounds = new Rect(left, top, right, bottom);
        var allBoundsCenter = allBounds.Center;
        var dx = center.X - allBoundsCenter.X;
        var dy = center.Y - allBoundsCenter.Y;
        target.Move(new Offset(dx, dy));
        foreach (var item in usages)
            item.Move(new Offset(dx, dy));
    }

    private static void LayoutGroups(DependencyItem target, List<DependencyGroup> groups)
    {
        const float yOffsetToCenter = 100;
        const float xOffsetToCenter = 100;
        var centerRect = target.Bounds;
        foreach (var group in groups)
        {
            group.LayoutItems();
            float offsetX;
            float offsetY;
            switch (group.Position)
            {
                case DependencyGroup.GroupPosition.Top:
                {
                    offsetX = (centerRect.Width - group.Width) / 2f + centerRect.Left;
                    offsetY = centerRect.Top - yOffsetToCenter - group.Height;
                    break;
                }
                case DependencyGroup.GroupPosition.Bottom:
                {
                    offsetX = (centerRect.Width - group.Width) / 2f + centerRect.Left;
                    offsetY = centerRect.Top + yOffsetToCenter;
                    break;
                }
                case DependencyGroup.GroupPosition.Left:
                {
                    offsetX = centerRect.Left - xOffsetToCenter - group.Width;
                    offsetY = (centerRect.Height - group.Height) / 2f + centerRect.Top;
                    break;
                }
                case DependencyGroup.GroupPosition.Right:
                {
                    offsetX = centerRect.Right + xOffsetToCenter;
                    offsetY = (centerRect.Height - group.Height) / 2f + centerRect.Top;
                    break;
                }
                default:
                    throw new UnreachableException();
            }

            group.Move(offsetX, offsetY);
        }
    }
}