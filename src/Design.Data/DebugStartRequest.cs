using AppBoxCore;

namespace AppBoxDesign;

public sealed class DebugStartRequest : IBinSerializable
{
    public ModelId ModelId { get; set; }
    public string AppName { get; set; } = null!;
    public string ServiceName { get; set; } = null!;
    public string MethodName { get; set; } = null!;
    public int[] Breakpoints { get; set; } = null!;

    //TODO: 调用服务的参数

    public void WriteTo(IOutputStream w)
    {
        //写入模型标识
        w.WriteLong(ModelId);
        //写入待调试的服务方法
        w.WriteString(AppName);
        w.WriteString(ServiceName);
        w.WriteString(MethodName);
        //写入Breakpoints
        w.WriteVariant(Breakpoints.Length);
        for (var i = 0; i < Breakpoints.Length; i++)
        {
            w.WriteInt(Breakpoints[i] + 1 /*暂加1行*/);
        }
        //TODO:最后写入调用参数
    }

    public void ReadFrom(IInputStream rs)
    {
        ModelId = rs.ReadLong();
        AppName = rs.ReadString()!;
        ServiceName = rs.ReadString()!;
        MethodName = rs.ReadString()!;

        var breakpointCount = rs.ReadVariant();
        Breakpoints = new int[breakpointCount];
        for (var i = 0; i < breakpointCount; i++)
        {
            Breakpoints[i] = rs.ReadInt();
        }
    }
}