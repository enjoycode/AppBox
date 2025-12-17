namespace AppBoxServer.Design;

public sealed class MIParserException : Exception { }

public sealed class MIParser
{
    public MIParser(Action<MIOutOfBandRecord> outputHandler, Action<MIResultRecord> resultHandler)
    {
        _outputHandler = outputHandler;
        _resultHandler = resultHandler;
    }

    private readonly Action<MIOutOfBandRecord> _outputHandler;
    private readonly Action<MIResultRecord> _resultHandler;

    public void ParseOutput(string line)
    {
        if (IsOutOfBandRecord(line))
        {
            _outputHandler(ParseOutOfBandRecord(line));
            return;
        }

        if (IsResultRecord(line))
        {
            _resultHandler(ParseResultRecord(line));
            return;
        }

        if (IsEnd(line))
        {
            //do nothing
            return;
        }

        throw new MIParserException();
    }

    private MIResultRecord ParseResultRecord(string response)
    {
        var token = ParseToken(response, 0, out var endIndex);

        if (response[endIndex] != '^')
            throw new MIParserException();

        var resultClass = ParseResultClass(response, endIndex + 1, out endIndex);
        var results = new List<MIResult>();

        while (endIndex != response.Length)
        {
            if (response[endIndex] != ',')
            {
                throw new MIParserException();
            }

            results.Add(ParseResult(response, endIndex + 1, out endIndex));
        }

        return new MIResultRecord(token, resultClass, results.ToArray());
    }

    private MIOutOfBandRecord ParseOutOfBandRecord(string response)
    {
        MIOutOfBandRecord outOfBandRecord;
        int endIndex;

        if (IsStreamRecord(response))
        {
            outOfBandRecord = ParseStreamRecord(response, 0, out endIndex);
        }
        else
        {
            outOfBandRecord = ParseAsyncRecord(response, 0, out endIndex);
        }

        if (endIndex != response.Length)
        {
            throw new MIParserException();
        }

        return outOfBandRecord;
    }

    private static MIToken? ParseToken(string response, int beginIndex, out int endIndex)
    {
        endIndex = beginIndex;

        while (Char.IsDigit(response[endIndex]))
        {
            endIndex++;
        }

        if (beginIndex == endIndex)
        {
            return null;
        }

        return new MIToken(
            Convert.ToUInt64(response.Substring(beginIndex, endIndex - beginIndex), 10)
        );
    }

    private static MIResultClass ParseResultClass(string response, int beginIndex, out int endIndex)
    {
        var resClasses = new[]
        {
            MIResultClass.Done,
            MIResultClass.Running,
            MIResultClass.Connected,
            MIResultClass.Error,
            MIResultClass.Exit,
        };

        foreach (var resClass in resClasses)
        {
            var strClass = resClass.ToString();
            var len = Math.Min(response.Length - beginIndex, strClass.Length);

            if (String.Compare(response, beginIndex, strClass, 0, len) == 0)
            {
                endIndex = beginIndex + strClass.Length;
                return resClass;
            }
        }

        throw new MIParserException();
    }

    private MIResult ParseResult(string response, int beginIndex, out int endIndex)
    {
        endIndex = response.IndexOf('=', beginIndex);
        var variable = response.Substring(beginIndex, endIndex - beginIndex);
        var miValue = ParseValue(response, endIndex + 1, out endIndex);

        return new MIResult(variable, miValue);
    }

    private MIValue ParseValue(string response, int beginIndex, out int endIndex)
    {
        return response[beginIndex] switch
        {
            '{' => ParseTuple(response, beginIndex, out endIndex),
            '[' => ParseList(response, beginIndex, out endIndex),
            '"' => ParseConst(response, beginIndex, out endIndex),
            _ => throw new MIParserException()
        };
    }

    private MITuple ParseTuple(string response, int beginIndex, out int endIndex)
    {
        beginIndex++; // eat '{'

        if (response[beginIndex] == '}')
        {
            endIndex = beginIndex + 1;
            return new MITuple(null);
        }

        var results = new List<MIResult>();
        results.Add(ParseResult(response, beginIndex, out endIndex));

        while (response[endIndex] == ',')
        {
            results.Add(ParseResult(response, endIndex + 1, out endIndex));
        }

        if (response[endIndex] == '}')
        {
            endIndex++;
            return new MITuple(results.ToArray());
        }

        throw new MIParserException();
    }

    private MIListElement ParseListElement(MIListElementType type, string response, int beginIndex, out int endIndex)
    {
        switch (type)
        {
            case MIListElementType.Value:
                return ParseValue(response, beginIndex, out endIndex);
            case MIListElementType.Result:
                return ParseResult(response, beginIndex, out endIndex);
        }

        throw new MIParserException();
    }

    private MIList ParseList(string response, int beginIndex, out int endIndex)
    {
        var elements = new List<MIListElement>();
        MIListElementType type;

        beginIndex++; // eat '['

        if (response[beginIndex] == ']')
        {
            endIndex = beginIndex + 1;
            // Element type of empty list can be either
            return new MIList(elements, MIListElementType.Value);
        }

        if (response[beginIndex] == '{' ||
            response[beginIndex] == '[' ||
            response[beginIndex] == '"'
           )
        {
            type = MIListElementType.Value;
        }
        else
        {
            type = MIListElementType.Result;
        }

        elements.Add(ParseListElement(type, response, beginIndex, out endIndex));

        while (response[endIndex] == ',')
        {
            elements.Add(ParseListElement(type, response, endIndex + 1, out endIndex));
        }

        if (response[endIndex] == ']')
        {
            endIndex++;
            return new MIList(elements, type);
        }

        throw new MIParserException();
    }

    private static MIConst ParseConst(string response, int beginIndex, out int endIndex)
    {
        for (endIndex = beginIndex + 1; endIndex < response.Length; endIndex++)
        {
            if (response[endIndex] == '"' && response[endIndex - 1] != '\\')
            {
                break;
            }
        }

        var cstring = response.Substring(beginIndex + 1, endIndex - beginIndex - 1);

        endIndex++;

        return new MIConst(cstring);
    }

    private MIOutOfBandRecord ParseAsyncRecord(string response, int beginIndex, out int endIndex)
    {
        var token = ParseToken(response, beginIndex, out endIndex);
        var asyncRecordClass = ParseAsyncRecordClass(response, endIndex, out endIndex);
        var asyncOutput = ParseAsyncOutput(response, endIndex, out endIndex);

        return new MIAsyncRecord(token, asyncRecordClass, asyncOutput);
    }

    private static MIAsyncRecordClass ParseAsyncRecordClass(string response, int beginIndex, out int endIndex)
    {
        endIndex = beginIndex + 1;

        return response[beginIndex] switch
        {
            '*' => MIAsyncRecordClass.Exec,
            '+' => MIAsyncRecordClass.Status,
            '=' => MIAsyncRecordClass.Notify,
            _ => throw new MIParserException()
        };
    }

    private MIAsyncOutput ParseAsyncOutput(string response, int beginIndex, out int endIndex)
    {
        var asyncClass = ParseAsyncOutputClass(response, beginIndex, out endIndex);

        var results = new List<MIResult>();

        while (endIndex != response.Length)
        {
            if (response[endIndex] != ',')
            {
                break;
            }

            results.Add(ParseResult(response, endIndex + 1, out endIndex));
        }

        return new MIAsyncOutput(asyncClass, results.ToArray());
    }

    private static MIAsyncOutputClass ParseAsyncOutputClass(string response, int beginIndex, out int endIndex)
    {
        endIndex = beginIndex;

        while (endIndex < response.Length)
        {
            if (response[endIndex] == ',')
                break;

            endIndex++;
        }

        var strClass = response.Substring(beginIndex, endIndex - beginIndex);

        if (strClass == "stopped")
        {
            return MIAsyncOutputClass.Stopped;
        }

        return MIAsyncOutputClass.Others(strClass);
    }

    private MIStreamRecord ParseStreamRecord(string response, int beginIndex, out int endIndex)
    {
        var streamRecordClass = ParseStreamRecordClass(response, beginIndex, out endIndex);
        var constant = ParseConst(response, endIndex, out endIndex);

        return new MIStreamRecord(streamRecordClass, constant);
    }

    private static MIStreamRecordClass ParseStreamRecordClass(string response, int beginIndex, out int endIndex)
    {
        endIndex = beginIndex + 1;

        return response[beginIndex] switch
        {
            '~' => MIStreamRecordClass.Console,
            '@' => MIStreamRecordClass.Target,
            '&' => MIStreamRecordClass.Log,
            _ => throw new MIParserException()
        };
    }

    private static bool IsOutOfBandRecord(string response)
    {
        return IsStreamRecord(response) || IsAsyncRecord(response);
    }

    private static bool IsStreamRecord(string response)
    {
        return response[0] == '~' ||
               response[0] == '@' ||
               response[0] == '&';
    }

    private static bool IsAsyncRecord(string response)
    {
        var i = 0;
        while (char.IsDigit(response[i]))
        {
            i++;
        }

        return response[i] == '*' ||
               response[i] == '+' ||
               response[i] == '=';
    }

    private static bool IsResultRecord(string response)
    {
        var i = 0;
        while (char.IsDigit(response[i]))
        {
            i++;
        }

        return response[i] == '^';
    }

    private static bool IsEnd(string response) => response == "(gdb)";
}