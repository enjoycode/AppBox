using System.Globalization;
using AppBoxCore;

namespace AppBoxDesign;

public static class CodeUtil
{
    private static readonly string[] Keywords = { "private", "protected" };

    private static readonly string[] ReservedEntityMemberNames = ["ModelId", "MODELID", "Target"];

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

    public static bool IsReservedEntityMemberName(string name) =>
        ReservedEntityMemberNames.Contains(name);

    private static bool IsKeyword(string value) => Keywords.Contains(value);

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
    public static string GetPluralStringOfModelType(ModelType modelType) =>
        modelType switch
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

    public static ModelType GetModelTypeFromPluralString(ReadOnlySpan<char> typeName) =>
        typeName switch
        {
            "Enums" => ModelType.Enum,
            "Entities" => ModelType.Entity,
            "Events" => ModelType.Event,
            "Services" => ModelType.Service,
            "Views" => ModelType.View,
            "Workflows" => ModelType.Workflow,
            "Reports" => ModelType.Report,
            "Permissions" => ModelType.Permission,
            _ => throw new NotSupportedException(typeName.ToString())
        };

    public static string ToLowCamelCase(string name) => char.ToLower(name[0]) + name[1..];

    public static string ServiceGlobalUsings() =>
        "global using System;global using System.Linq;global using System.Collections.Generic;global using System.Threading.Tasks;global using AppBoxCore;global using AppBoxStore;";

    public static string ViewGlobalUsings() =>
        "global using System;global using System.Threading.Tasks;global using System.Linq;global using System.Collections.Generic;global using PixUI;global using AppBoxCore;global using AppBoxClient;";
}