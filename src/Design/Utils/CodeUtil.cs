using System.Globalization;
using AppBoxCore;

namespace AppBoxDesign;

public static class CodeUtil
{
    private static readonly string[] _keywords = { "private", "protected" };

    public static bool IsValidIdentifier(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return false;
        }

        if (value.Length > 0x200)
        {
            return false;
        }

        if (value[0] != '@')
        {
            if (IsKeyword(value))
            {
                return false;
            }
        }
        else
        {
            value = value.Substring(1);
        }

        return IsValidLanguageIndependentIdentifier(value);
    }

    private static bool IsKeyword(string value)
    {
        return _keywords.Contains(value);
    }

    public static bool IsValidLanguageIndependentIdentifier(string value)
    {
        return IsValidTypeNameOrIdentifier(value, false);
    }

    private static bool IsValidTypeNameOrIdentifier(string value, bool isTypeName)
    {
        bool nextMustBeStartChar = true;
        if (value.Length == 0)
        {
            return false;
        }

        for (int i = 0; i < value.Length; i++)
        {
            char c = value[i];
            switch (char.GetUnicodeCategory(c))
            {
                case UnicodeCategory.UppercaseLetter:
                case UnicodeCategory.LowercaseLetter:
                case UnicodeCategory.TitlecaseLetter:
                case UnicodeCategory.ModifierLetter:
                case UnicodeCategory.OtherLetter:
                case UnicodeCategory.LetterNumber:
                {
                    nextMustBeStartChar = false;
                    continue;
                }
                case UnicodeCategory.NonSpacingMark:
                case UnicodeCategory.SpacingCombiningMark:
                case UnicodeCategory.DecimalDigitNumber:
                case UnicodeCategory.ConnectorPunctuation:
                    if (!nextMustBeStartChar || (c == '_'))
                    {
                        break;
                    }

                    return false;

                default:
                    if (!isTypeName || !IsSpecialTypeChar(c, ref nextMustBeStartChar))
                    {
                        return false;
                    }

                    break;
            }

            nextMustBeStartChar = false;
            continue;
        }

        return true;
    }

    private static bool IsSpecialTypeChar(char ch, ref bool nextMustBeStartChar)
    {
        switch (ch)
        {
            case '[':
            case ']':
            case '$':
            case '&':
            case '*':
            case '+':
            case ',':
            case '-':
            case '.':
            case ':':
            case '<':
            case '>':
                nextMustBeStartChar = true;
                return true;

            case '`':
                return true;
        }

        return false;
    }

    /// <summary>
    /// 获取模型类型的复数名称
    /// </summary>
    public static string GetPluralStringOfModelType(ModelType modelType)
    {
        return modelType switch
        {
            ModelType.Enum => "Enums",
            ModelType.Entity => "Entities",
            ModelType.Event => "Events",
            ModelType.Service => "Services",
            ModelType.View => "Views",
            ModelType.Workflow => "Workflows",
            ModelType.Report => "Reports",
            ModelType.Permission => "Permissions",
            _ => throw new NotSupportedException()
        };
    }

    public static ModelType GetModelTypeFromPluralString(ReadOnlySpan<char> typeName)
    {
        return typeName switch
        {
            var s when s.SequenceEqual("Enums") => ModelType.Enum,
            var s when s.SequenceEqual("Entities") => ModelType.Entity,
            var s when s.SequenceEqual("Events") => ModelType.Event,
            var s when s.SequenceEqual("Services") => ModelType.Service,
            var s when s.SequenceEqual("Views") => ModelType.View,
            var s when s.SequenceEqual("Workflows") => ModelType.Workflow,
            var s when s.SequenceEqual("Reports") => ModelType.Report,
            var s when s.SequenceEqual("Permissions") => ModelType.Permission,
            _ => throw new NotSupportedException(typeName.ToString())
        };
    }
}