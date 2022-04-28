using AppBoxCore;

namespace AppBoxDesign;

internal interface IDesignHandler
{
    ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args);
}