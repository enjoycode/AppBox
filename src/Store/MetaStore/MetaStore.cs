using System;

namespace AppBoxStore;

public static class MetaStore
{
    private static IMetaStore? _provider;

    public static IMetaStore Provider => _provider!;

    public static void Init(IMetaStore provider)
    {
        if (_provider != null) throw new Exception();
        _provider = provider;
    }
}