using System.Collections;
using System.Text;

namespace AppBoxServer.Design;

public enum MIValueType
{
    Const,
    Tuple,
    List,
}

public enum MIListElementType
{
    Value,
    Result,
}

public enum MIOutOfBandRecordType
{
    Async,
    Stream,
}

public sealed class MIResultRecord
{
    public MIResultRecord(MIToken? token, MIResultClass resultClass, MIResult[]? results)
    {
        Token = token;
        Class = resultClass;
        _results = new Dictionary<string, MIValue>();

        if (results != null)
        {
            foreach (var result in results)
            {
                _results.Add(result.Variable, result.Value);
            }
        }
    }

    public override string ToString()
    {
        var sb = new StringBuilder();

        if (Token != null) sb.Append(Token);

        sb.Append('^');
        sb.Append(Class);

        foreach (var pair in _results)
        {
            sb.Append(',');
            sb.Append(pair.Value);
        }

        return sb.ToString();
    }

    public MIValue this[string variable] => _results[variable];

    public readonly MIToken? Token;
    public readonly MIResultClass Class;
    private readonly Dictionary<string, MIValue> _results;
}

public abstract class MIOutOfBandRecord
{
    protected MIOutOfBandRecord(MIOutOfBandRecordType type)
    {
        Type = type;
    }

    public override string ToString() => string.Empty;

    public readonly MIOutOfBandRecordType Type;
}

public readonly struct MIToken
{
    public MIToken(ulong number)
    {
        Number = number;
    }

    public override string ToString() => Number.ToString();

    public readonly ulong Number;
}

public abstract class MIListElement
{
    public MIListElement(MIListElementType type)
    {
        ElementType = type;
    }

    public override string ToString() => string.Empty;

    public readonly MIListElementType ElementType;
}

public abstract class MIValue : MIListElement
{
    public MIValue(MIValueType type)
        : base(MIListElementType.Value) { }

    public override string ToString() => string.Empty;

    public MIListElementType Type;
}

public sealed class MITuple : MIValue, IEnumerable
{
    public MITuple() : base(MIValueType.Tuple)
    {
        _results = new Dictionary<string, MIValue>();
    }

    public MITuple(MIResult[]? results) : base(MIValueType.Tuple)
    {
        _results = new Dictionary<string, MIValue>();

        if (results != null)
        {
            foreach (var result in results)
            {
                _results.Add(result.Variable, result.Value);
            }
        }
    }

    public override string ToString()
    {
        bool firstElement = true;
        var sb = new StringBuilder("{");

        foreach (var pair in _results)
        {
            if (firstElement)
            {
                firstElement = false;
            }
            else
            {
                sb.Append(',');
            }

            sb.Append(pair.Key + "=" + pair.Value);
        }

        sb.Append('}');

        return sb.ToString();
    }

    public void Add(string variable, MIValue val)
    {
        _results.Add(variable, val);
    }

    public void Add(string variable, string val)
    {
        _results.Add(variable, new MIConst(val));
    }

    public MIValue this[string variable] => _results[variable];

    public IEnumerator GetEnumerator() => _results.GetEnumerator();

    private Dictionary<string, MIValue> _results;
}

public sealed class MIList : MIValue, IEnumerable
{
    public MIList() : base(MIValueType.List)
    {
        _elements = new List<MIListElement>();
    }

    public MIList(List<MIListElement> elements, MIListElementType elementType)
        : base(MIValueType.List)
    {
        _elementsType = elementType;
        _elements = elements;
    }

    public MIList(MIValue[] values) : base(MIValueType.List)
    {
        _elementsType = MIListElementType.Value;

        _elements = new List<MIListElement>(values);
    }

    public MIListElement this[int index] => _elements[index];

    public void Add(string cstring)
    {
        if (_elements.Count == 0)
        {
            _elementsType = MIListElementType.Value;
        }

        _elements.Add(new MIConst(cstring));
    }

    public void Add(MIListElement element)
    {
        if (_elements.Count == 0)
        {
            _elementsType = element.ElementType;
        }

        if (_elementsType != element.ElementType)
        {
            throw new Exception();
        }

        _elements.Add(element);
    }

    public IEnumerator GetEnumerator() => _elements.GetEnumerator();

    public override string ToString()
    {
        bool firstElement = true;
        var sb = new StringBuilder("[");

        foreach (MIListElement element in _elements)
        {
            if (firstElement)
            {
                firstElement = false;
            }
            else
            {
                sb.Append(',');
            }

            sb.Append(element);
        }

        sb.Append(']');

        return sb.ToString();
    }

    public MIListElement[] ToArray() => _elements.ToArray();

    public int Count => _elements.Count;

    private MIListElementType _elementsType;
    private readonly List<MIListElement> _elements;
}

public sealed class MIConst : MIValue
{
    public MIConst(string cstring) : base(MIValueType.Const)
    {
        CString = cstring;
    }

    public override string ToString() => $"\"{CString}\"";

    public readonly string CString;

    // return c-string without escape sequences
    // https://en.wikipedia.org/wiki/Escape_sequences_in_C
    // throw exception for invalid c-string
    public string GetString()
    {
        var sb = new StringBuilder();
        try
        {
            for (int i = 0; i < CString.Length;)
            {
                if (CString[i] == '\\')
                {
                    char c;
                    int hex;
                    switch (CString[i + 1])
                    {
                        case 'a':
                            c = '\a';
                            i += 2;
                            break;
                        case 'b':
                            c = '\b';
                            i += 2;
                            break;
                        case 'f':
                            c = '\f';
                            i += 2;
                            break;
                        case 'n':
                            c = '\n';
                            i += 2;
                            break;
                        case 'r':
                            c = '\r';
                            i += 2;
                            break;
                        case 't':
                            c = '\t';
                            i += 2;
                            break;
                        case 'v':
                            c = '\v';
                            i += 2;
                            break;
                        case '\\':
                            c = '\\';
                            i += 2;
                            break;
                        case '\'':
                            c = '\'';
                            i += 2;
                            break;
                        case '\"':
                            c = '\"';
                            i += 2;
                            break;
                        case '?':
                            c = '\u003f';
                            i += 2;
                            break;
                        case '0':
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                            int num2 = CString[i + 2] - '0';
                            int num1 = CString[i + 3] - '0';
                            int num0 = CString[i + 4] - '0';
                            c = (char)(num2 * 64 + num1 * 8 + num0);
                            i += 5;
                            break;
                        case 'e':
                            c = '\u001b';
                            i += 2;
                            break;
                        case 'U':
                            hex = Int32.Parse(CString.Substring(i + 2, i + 10),
                                System.Globalization.NumberStyles.HexNumber);
                            c = (char)hex;
                            i += 11;
                            break;
                        case 'u':
                            hex = Int32.Parse(CString.Substring(i + 2, i + 6),
                                System.Globalization.NumberStyles.HexNumber);
                            c = (char)hex;
                            i += 7;
                            break;
                        default:
                            throw new FormatException();
                    }

                    sb.Append(c);
                }
                else
                {
                    sb.Append(CString[i]);
                    i++;
                }
            }
        }
        catch
        {
            throw new FormatException("Invalid c-string");
        }

        return sb.ToString();
    }

    public int GetInt() => int.Parse(CString);
}

public sealed class MIResult : MIListElement
{
    public MIResult(string variable, MIValue val) : base(MIListElementType.Result)
    {
        Variable = variable;
        Value = val;
    }

    public MIResult(string variable, string cstring) : base(MIListElementType.Result)
    {
        Variable = variable;
        Value = new MIConst(cstring);
    }

    public override string ToString() => $"{Variable}={Value}";

    public readonly string Variable;
    public readonly MIValue Value;
}

public sealed class MIAsyncRecord : MIOutOfBandRecord
{
    public MIAsyncRecord(MIToken? token, MIAsyncRecordClass cl, MIAsyncOutput output)
        : base(MIOutOfBandRecordType.Async)
    {
        Token = token;
        Class = cl;
        Output = output;
    }

    public override string ToString()
    {
        var sb = new StringBuilder();

        if (Token != null)
            sb.Append(Token);

        sb.Append(Class);
        sb.Append(Output);

        return sb.ToString();
    }

    public readonly MIToken? Token;
    public readonly MIAsyncRecordClass Class;
    public readonly MIAsyncOutput Output;
}

public sealed class MIStreamRecord : MIOutOfBandRecord
{
    public MIStreamRecord(MIStreamRecordClass cl, MIConst constant)
        : base(MIOutOfBandRecordType.Stream)
    {
        Class = cl;
        Const = constant;
    }

    public override string ToString() => Class + Const.ToString();

    public readonly MIStreamRecordClass Class;
    public readonly MIConst Const;
}

public sealed class MIAsyncOutput
{
    public MIAsyncOutput(MIAsyncOutputClass cl, MIResult[]? results)
    {
        Class = cl;
        Results = new Dictionary<string, MIValue>();

        if (results != null)
        {
            foreach (var result in results)
            {
                Results.Add(result.Variable, result.Value);
            }
        }
    }

    public override string ToString()
    {
        var sb = new StringBuilder(Class.ToString());

        foreach (var result in Results)
        {
            sb.Append(',');
            sb.Append(result.Key);
            sb.Append('=');
            sb.Append(result.Value);
        }

        return sb.ToString();
    }

    public MIValue this[string variable] => Results[variable];

    public readonly MIAsyncOutputClass Class;
    public readonly Dictionary<string, MIValue> Results;
}

public readonly struct MIResultClass
{
    public static MIResultClass Done { get; private set; } = new("done");
    public static MIResultClass Running { get; private set; } = new("running");
    public static MIResultClass Connected { get; private set; } = new("connected");
    public static MIResultClass Error { get; private set; } = new("error");
    public static MIResultClass Exit { get; private set; } = new("exit");

    public override string ToString() => Representation;

    private MIResultClass(string reprsentation)
    {
        Representation = reprsentation;
    }

    public readonly string Representation;
}

public readonly struct MIAsyncOutputClass : IEquatable<MIAsyncOutputClass>
{
    public static MIAsyncOutputClass Stopped { get; private set; } = new("stopped");

    public static MIAsyncOutputClass Others(string representation)
    {
        return new MIAsyncOutputClass(representation);
    }

    private MIAsyncOutputClass(string representation)
    {
        Represenation = representation;
    }

    public readonly string Represenation;

    public override string ToString() => Represenation;

    #region ====IEquatable====

    public bool Equals(MIAsyncOutputClass other) => Represenation == other.Represenation;

    public override bool Equals(object? obj) => obj is MIAsyncOutputClass other && Equals(other);

    public override int GetHashCode() => Represenation.GetHashCode();

    public static bool operator ==(MIAsyncOutputClass left, MIAsyncOutputClass right) => left.Equals(right);

    public static bool operator !=(MIAsyncOutputClass left, MIAsyncOutputClass right) => !(left == right);

    #endregion
}

public readonly struct MIAsyncRecordClass
{
    public static MIAsyncRecordClass Exec { get; private set; } = new("*");
    public static MIAsyncRecordClass Status { get; private set; } = new("+");
    public static MIAsyncRecordClass Notify { get; private set; } = new("=");

    public override string ToString() => Represenation;

    private MIAsyncRecordClass(string represenation)
    {
        Represenation = represenation;
    }

    public readonly string Represenation;
}

public readonly struct MIStreamRecordClass
{
    public static MIStreamRecordClass Console { get; private set; } = new("~");
    public static MIStreamRecordClass Target { get; private set; } = new("@");
    public static MIStreamRecordClass Log { get; private set; } = new("&");

    private MIStreamRecordClass(string representation)
    {
        Represenation = representation;
    }

    public readonly string Represenation;

    public override string ToString() => Represenation;
}