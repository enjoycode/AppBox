using System;
using System.Collections.Generic;

namespace CodeEditor
{
    internal sealed class CSharpLanguage : ICodeLanguage
    {
        public char? GetAutoColsingPairs(char ch)
        {
            switch (ch)
            {
                case '{': return '}';
                case '[': return ']';
                case '(': return ')';
                case '"': return '"';
                default: return null;
            }
        }

        #region ====ITokensProvider====

        private static readonly StringMap<TokenType> TokenMap = new StringMap<TokenType>(
            new (string, TokenType)[]
            {
                (";", TokenType.PunctuationDelimiter),
                (".", TokenType.PunctuationDelimiter),
                (",", TokenType.PunctuationDelimiter),

                ("--", TokenType.Operator),
                ("-", TokenType.Operator),
                ("-=", TokenType.Operator),
                ("&", TokenType.Operator),
                ("&&", TokenType.Operator),
                ("+", TokenType.Operator),
                ("++", TokenType.Operator),
                ("+=", TokenType.Operator),
                ("<", TokenType.Operator),
                ("<<", TokenType.Operator),
                ("=", TokenType.Operator),
                ("==", TokenType.Operator),
                ("!", TokenType.Operator),
                ("!=", TokenType.Operator),
                ("=>", TokenType.Operator),
                (">", TokenType.Operator),
                (">>", TokenType.Operator),
                ("|", TokenType.Operator),
                ("||", TokenType.Operator),
                ("?", TokenType.Operator),
                ("??", TokenType.Operator),
                ("^", TokenType.Operator),
                ("~", TokenType.Operator),
                ("*", TokenType.Operator),
                ("/", TokenType.Operator),
                ("%", TokenType.Operator),
                (":", TokenType.Operator),

                ("(", TokenType.PunctuationBracket),
                (")", TokenType.PunctuationBracket),
                ("[", TokenType.PunctuationBracket),
                ("]", TokenType.PunctuationBracket),
                ("{", TokenType.PunctuationBracket),
                ("}", TokenType.PunctuationBracket),

                ("as", TokenType.Keyword), //as
                ("base", TokenType.Keyword), //base
                ("break", TokenType.Keyword), //break
                ("case", TokenType.Keyword), //case
                ("catch", TokenType.Keyword), //catch
                ("checked", TokenType.Keyword), //checked
                ("class", TokenType.Keyword), //class
                ("continue", TokenType.Keyword), //continue
                ("default", TokenType.Keyword), //default
                ("delegate", TokenType.Keyword), //delegate
                ("do", TokenType.Keyword), //do
                ("else", TokenType.Keyword), //else
                ("enum", TokenType.Keyword), //enum
                ("event", TokenType.Keyword), //event
                ("explicit", TokenType.Keyword), //explicit
                ("finally", TokenType.Keyword), //finally
                ("for", TokenType.Keyword), //for
                ("foreach", TokenType.Keyword), //foreach
                ("goto", TokenType.Keyword), //goto
                ("if", TokenType.Keyword), //if
                ("implicit", TokenType.Keyword), //implicit
                ("interface", TokenType.Keyword), //interface
                ("is", TokenType.Keyword), //is
                ("lock", TokenType.Keyword), //lock
                ("namespace", TokenType.Keyword), //namespace
                ("operator", TokenType.Keyword), //operator
                ("params", TokenType.Keyword), //params
                ("return", TokenType.Keyword), //return
                ("sizeof", TokenType.Keyword), //sizeof
                ("stackalloc", TokenType.Keyword), //stackalloc
                ("struct", TokenType.Keyword), //struct
                ("switch", TokenType.Keyword), //switch
                ("throw", TokenType.Keyword), //throw
                ("try", TokenType.Keyword), //try
                ("typeof", TokenType.Keyword), //typeof
                ("unchecked", TokenType.Keyword), //unchecked
                ("using", TokenType.Keyword), //using
                ("while", TokenType.Keyword), //while
                ("new", TokenType.Keyword), //new
                ("await", TokenType.Keyword), //await
                ("in", TokenType.Keyword), //in
                ("yield", TokenType.Keyword), //yield
                ("get", TokenType.Keyword), //get
                ("set", TokenType.Keyword), //set
                ("when", TokenType.Keyword), //when
                ("out", TokenType.Keyword), //out
                ("ref", TokenType.Keyword), //ref
                ("from", TokenType.Keyword), //from
                ("where", TokenType.Keyword), //where
                ("select", TokenType.Keyword), //select
                ("record", TokenType.Keyword), //record
                ("init", TokenType.Keyword), //init
                ("with", TokenType.Keyword), //with
                ("let", TokenType.Keyword), //let
                ("var", TokenType.Keyword), //this
                ("this", TokenType.Keyword), //this
            });

        public bool IsLeafNode(TSSyntaxNode node)
        {
            var type = node.Type;
            return type == "modifier" || type == "string_literal" || type == "character_literal";
        }

        public TokenType GetTokenType(TSSyntaxNode node)
        {
            var type = node.Type;
            if (type == "Error")
                return TokenType.Unknown;

            if (!node.IsNamed())
            {
                TokenType? res = TokenMap.get(type);
                return res ?? TokenType.Unknown;
            }

            // is named node
            switch (type)
            {
                case "identifier":
                    return GetIdentifierTokenType(node);

                case "implicit_type":
                case "pointer_type":
                case "function_pointer_type":
                case "predefined_type":
                    return TokenType.BuiltinType;

                case "real_literal":
                case "integer_literal":
                    return TokenType.LiteralNumber;

                case "string_literal":
                case "character_literal":
                    return TokenType.LiteralString;

                case "null_literal":
                case "boolean_literal":
                    return TokenType.Constant;

                case "modifier":
                case "void_keyword":
                    return TokenType.Keyword;

                case "comment":
                    return TokenType.Comment;
                default:
                    return TokenType.Unknown;
                //throw new NotImplementedException(node.Type);
            }
        }

        private static TokenType GetIdentifierTokenType(TSSyntaxNode node)
        {
            var parentType = node.Parent!.Type;
            if (parentType == "Error")
                return TokenType.Unknown;

            switch (parentType)
            {
                case "namespace_declaration":
                case "using_directive":
                    return TokenType.Module;

                case "class_declaration":
                case "interface_declaration":
                case "enum_declaration":
                case "struct_declaration":
                case "record_declaration":
                case "object_creation_expression":
                case "constructor_declaration":
                case "generic_name":
                case "array_type":
                case "base_list":
                    return TokenType.Type;

                case "argument":
                case "variable_declarator":
                case "property_declaration":
                    return TokenType.Variable;

                case "method_declaration":
                    return TokenType.Function;

                case "qualified_name":
                    return GetIdentifierTypeFromQualifiedName(node);
                case "member_access_expression":
                    return GetIdentifierTypeFromMemberAccess(node);

                default:
                    return TokenType.Unknown;
            }
        }

        private static TokenType GetIdentifierTypeFromQualifiedName(TSSyntaxNode node)
        {
            if (node.Parent!.Parent?.Type == "qualified_name")
                return TokenType.Module;
            if (node.Parent!.Parent?.Type == "assignment_expression")
                return TokenType.Variable; //TODO:是否静态类型的成员

            return node.NextNamedSibling == null ? TokenType.Type : TokenType.Module;
        }

        /// <summary>
        /// Get identifier token type from MemberAccess
        /// </summary>
        /// <param name="node">MemberAccessNode, eg: "some.identifier"</param>
        private static TokenType GetIdentifierTypeFromMemberAccess(TSSyntaxNode node)
        {
            if (node.Parent!.Parent!.Type == "invocation_expression")
                return TokenType.Function;
            //TODO:查找上下文变量列表
            return node.NextNamedSibling == null ? TokenType.Variable : TokenType.Type;
        }

        #endregion

        #region ====IFoldingProvider====

        //参考: https://github.com/nvim-treesitter/nvim-treesitter/blob/master/queries/c_sharp/folds.scm
        private const string FoldQuery = @"
body: [
  (declaration_list)
  (switch_body)
  (enum_member_declaration_list)
] @fold

accessors: [
  (accessor_list)
] @fold

initializer: [
  (initializer_expression)
] @fold

(block) @fold
";

        private TSQuery? _foldQuery;

        public List<FoldMarker>? GenerateFoldMarkers(Document document)
        {
            var syntaxParser = document.SyntaxParser;
            if (syntaxParser.RootNode == null) return null;

            _foldQuery ??= syntaxParser.CreateQuery(FoldQuery);
            var captures = _foldQuery.Captures(syntaxParser.RootNode);
#if __WEB__
            var lastNodeId = 0;
#else
            var lastNodeId = IntPtr.Zero;
#endif
            var result = new List<FoldMarker>(captures.Length);
            foreach (var capture in captures)
            {
                if (lastNodeId == capture.node.id) continue;
                lastNodeId = capture.node.id;

#if __WEB__
                var node = capture.node;
#else
                var node = TSSyntaxNode.Create(capture.node)!;
#endif

                //暂跳过同一行的
                if (node.StartPosition.row == node.EndPosition.row) continue;

                var startIndex = node.StartIndex / SyntaxParser.ParserEncoding;
                var endIndex = node.EndIndex / SyntaxParser.ParserEncoding;

                var mark = new FoldMarker(document, 0, 0, 0, 0, FoldType.TypeBody, "{...}");
                mark.Offset = startIndex;
                mark.Length = endIndex - startIndex;
                result.Add(mark);
            }

            return result;
        }

        #endregion
    }
}