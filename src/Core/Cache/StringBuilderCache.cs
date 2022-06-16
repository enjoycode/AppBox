using System.Runtime.CompilerServices;
using System.Text;

namespace AppBoxCore;

public static class StringBuilderCache
{
    private const int MAX_BUILDER_SIZE = 2048;
    private const int DEFAULT_CAPACITY = 16;
    private const int MAX_CACHED_INSTANCES = 4;

    [ThreadStatic] private static List<StringBuilder>? _cachedInstances;

    /// <summary>
    /// Acquires a string builder with the capacity specified. If no cached string builder is found with the requested capacity a new one is returned. If there are 
    /// cached stringbuilders with at least the requested capacity, the one with the minimal capacity is returned.  
    /// </summary>
    public static StringBuilder Acquire(int capacity = DEFAULT_CAPACITY)
    {
        _cachedInstances ??= new List<StringBuilder>(MAX_CACHED_INSTANCES);

        if (capacity <= MAX_BUILDER_SIZE)
        {
            // find the instance which has the lowest size matching the requested capacity, if any.
            StringBuilder? minimalMatchingCachedInstance = null;
            StringBuilder? minimalOverallInstance = null;
            var indexToRemove = -1;
            var indexMinimalOverall = -1;
            for (var i = 0; i < _cachedInstances.Count; i++)
            {
                var cachedInstance = _cachedInstances[i];
                if (minimalOverallInstance == null ||
                    minimalOverallInstance.Capacity > cachedInstance.Capacity)
                {
                    minimalOverallInstance = cachedInstance;
                    indexMinimalOverall = i;
                }

                if (capacity <= cachedInstance.Capacity && (minimalMatchingCachedInstance == null ||
                                                            minimalMatchingCachedInstance.Capacity >
                                                            cachedInstance.Capacity))
                {
                    minimalMatchingCachedInstance = cachedInstance;
                    indexToRemove = i;
                }
            }

            if (minimalMatchingCachedInstance == null)
            {
                // check if the cache is at capacity. If so, remove the one with the lowest capacity, which we determined in the previous loop. The cleared space is then
                // to be filled with the new string builder we'll return which is of the capacity requested.
                if (_cachedInstances.Count >= MAX_CACHED_INSTANCES)
                {
                    _cachedInstances.RemoveAt(indexMinimalOverall);
                }
            }
            else
            {
                _cachedInstances.RemoveAt(indexToRemove);
                minimalMatchingCachedInstance.Length = 0;
                return minimalMatchingCachedInstance;
            }
        }

        // not a matching cached instance found, return a brand new one.
        return new StringBuilder(capacity);
    }

    /// <summary>
    /// Releases the specified string builder and add it to the cache, if it's not at capacity already.
    /// </summary>
    /// <param name="sb">The string builder to release.</param>
    public static void Release(StringBuilder? sb)
    {
        if (sb == null)
            return;

        if (_cachedInstances!.Count >= MAX_CACHED_INSTANCES)
        {
            // already at capacity, ignore
            return;
        }

        if (sb.Capacity <= MAX_BUILDER_SIZE)
        {
            _cachedInstances.Add(sb);
        }
    }

    /// <summary>
    /// Gets the string from the string builder specified and calls release on it
    /// </summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static string GetStringAndRelease(StringBuilder? sb)
    {
        if (sb == null)
            return string.Empty;

        var result = sb.ToString();
        Release(sb);
        return result;
    }
}