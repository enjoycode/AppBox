namespace AppBoxDesign;

public static class EnumerableExtensions
{
    #region ====IndexOf====

    public static int IndexOf<T>(this IEnumerable<T> sequence, T value)
    {
        int num;
        switch (sequence)
        {
            case IList<T> objList:
                num = objList.IndexOf(value);
                break;
            case IReadOnlyList<T> list:
                num = IndexOf<T>(list, value, EqualityComparer<T>.Default);
                break;
            default:
                num = EnumeratingIndexOf<T>(sequence, value, EqualityComparer<T>.Default);
                break;
        }

        return num;
    }

    public static int IndexOf<T>(this IEnumerable<T> sequence, T value, IEqualityComparer<T> comparer)
    {
        return !(sequence is IReadOnlyList<T> list)
            ? EnumeratingIndexOf<T>(sequence, value, comparer)
            : IndexOf<T>(list, value, comparer);
    }

    private static int EnumeratingIndexOf<T>(this IEnumerable<T> sequence, T value, IEqualityComparer<T> comparer)
    {
        int num = 0;
        foreach (T x in sequence)
        {
            if (comparer.Equals(x, value))
                return num;
            ++num;
        }

        return -1;
    }

    public static int IndexOf<T>(this IReadOnlyList<T> list, T value, IEqualityComparer<T> comparer)
    {
        int index = 0;
        for (int count = list.Count; index < count; ++index)
        {
            if (comparer.Equals(list[index], value))
                return index;
        }

        return -1;
    }

    #endregion
}