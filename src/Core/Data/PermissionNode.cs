namespace AppBoxCore;

/// <summary>
/// 用于运行时权限分配包装PermissionModel形成权限树
/// </summary>
public sealed class PermissionNode : IBinSerializable
{
    public string Name { get; internal set; } = null!;

    public IList<PermissionNode>? Children { get; internal set; }

    public string? ModelId { get; internal set; }

    public IList<Guid>? OrgUnits { get; internal set; }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteString(Name);
        if (Children != null)
        {
            //folder node
            ws.WriteVariant(Children.Count);
            for (var i = 0; i < Children.Count; i++)
            {
                Children[i].WriteTo(ws);
            }
        }
        else
        {
            //permission node
            ws.WriteVariant(-1);
            ws.WriteString(ModelId);
            ws.WriteVariant(OrgUnits!.Count);
            for (var i = 0; i < OrgUnits.Count; i++)
            {
                ws.WriteGuid(OrgUnits[i]);
            }
        }
    }

    public void ReadFrom(IInputStream rs)
    {
        Name = rs.ReadString()!;
        var count = rs.ReadVariant();
        if (count >= 0)
        {
            Children = new List<PermissionNode>(count);
            for (var i = 0; i < count; i++)
            {
                var child = new PermissionNode();
                child.ReadFrom(rs);
                Children.Add(child);
            }
        }
        else
        {
            ModelId = rs.ReadString()!;
            count = rs.ReadVariant();
            OrgUnits = new List<Guid>(count);
            for (var i = 0; i < count; i++)
            {
                OrgUnits.Add(rs.ReadGuid());
            }
        }
    }
}