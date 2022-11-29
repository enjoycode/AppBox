import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class CSharpLanguage implements CodeEditor.ICodeLanguage {
    public GetAutoColsingPairs(ch: number): Nullable<number> {
        switch (ch) {
            case 123:
                return 125;
            case 91:
                return 93;
            case 40:
                return 41;
            case 34:
                return 34;
            default:
                return null;
        }
    }


    private static readonly TokenMap: System.StringMap<CodeEditor.TokenType> = new System.StringMap<CodeEditor.TokenType>(
        [
            [";", CodeEditor.TokenType.PunctuationDelimiter],
            [".", CodeEditor.TokenType.PunctuationDelimiter],
            [",", CodeEditor.TokenType.PunctuationDelimiter],
            ["--", CodeEditor.TokenType.Operator],
            ["-", CodeEditor.TokenType.Operator],
            ["-=", CodeEditor.TokenType.Operator],
            ["&", CodeEditor.TokenType.Operator],
            ["&&", CodeEditor.TokenType.Operator],
            ["+", CodeEditor.TokenType.Operator],
            ["++", CodeEditor.TokenType.Operator],
            ["+=", CodeEditor.TokenType.Operator],
            ["<", CodeEditor.TokenType.Operator],
            ["<<", CodeEditor.TokenType.Operator],
            ["=", CodeEditor.TokenType.Operator],
            ["==", CodeEditor.TokenType.Operator],
            ["!", CodeEditor.TokenType.Operator],
            ["!=", CodeEditor.TokenType.Operator],
            ["=>", CodeEditor.TokenType.Operator],
            [">", CodeEditor.TokenType.Operator],
            [">>", CodeEditor.TokenType.Operator],
            ["|", CodeEditor.TokenType.Operator],
            ["||", CodeEditor.TokenType.Operator],
            ["?", CodeEditor.TokenType.Operator],
            ["??", CodeEditor.TokenType.Operator],
            ["^", CodeEditor.TokenType.Operator],
            ["~", CodeEditor.TokenType.Operator],
            ["*", CodeEditor.TokenType.Operator],
            ["/", CodeEditor.TokenType.Operator],
            ["%", CodeEditor.TokenType.Operator],
            [":", CodeEditor.TokenType.Operator],
            ["(", CodeEditor.TokenType.PunctuationBracket],
            [")", CodeEditor.TokenType.PunctuationBracket],
            ["[", CodeEditor.TokenType.PunctuationBracket],
            ["]", CodeEditor.TokenType.PunctuationBracket],
            ["{", CodeEditor.TokenType.PunctuationBracket],
            ["}", CodeEditor.TokenType.PunctuationBracket],
            ["as", CodeEditor.TokenType.Keyword], //as
            ["base", CodeEditor.TokenType.Keyword], //base
            ["break", CodeEditor.TokenType.Keyword], //break
            ["case", CodeEditor.TokenType.Keyword], //case
            ["catch", CodeEditor.TokenType.Keyword], //catch
            ["checked", CodeEditor.TokenType.Keyword], //checked
            ["class", CodeEditor.TokenType.Keyword], //class
            ["continue", CodeEditor.TokenType.Keyword], //continue
            ["default", CodeEditor.TokenType.Keyword], //default
            ["delegate", CodeEditor.TokenType.Keyword], //delegate
            ["do", CodeEditor.TokenType.Keyword], //do
            ["else", CodeEditor.TokenType.Keyword], //else
            ["enum", CodeEditor.TokenType.Keyword], //enum
            ["event", CodeEditor.TokenType.Keyword], //event
            ["explicit", CodeEditor.TokenType.Keyword], //explicit
            ["finally", CodeEditor.TokenType.Keyword], //finally
            ["for", CodeEditor.TokenType.Keyword], //for
            ["foreach", CodeEditor.TokenType.Keyword], //foreach
            ["goto", CodeEditor.TokenType.Keyword], //goto
            ["if", CodeEditor.TokenType.Keyword], //if
            ["implicit", CodeEditor.TokenType.Keyword], //implicit
            ["interface", CodeEditor.TokenType.Keyword], //interface
            ["is", CodeEditor.TokenType.Keyword], //is
            ["lock", CodeEditor.TokenType.Keyword], //lock
            ["namespace", CodeEditor.TokenType.Keyword], //namespace
            ["operator", CodeEditor.TokenType.Keyword], //operator
            ["params", CodeEditor.TokenType.Keyword], //params
            ["return", CodeEditor.TokenType.Keyword], //return
            ["sizeof", CodeEditor.TokenType.Keyword], //sizeof
            ["stackalloc", CodeEditor.TokenType.Keyword], //stackalloc
            ["struct", CodeEditor.TokenType.Keyword], //struct
            ["switch", CodeEditor.TokenType.Keyword], //switch
            ["throw", CodeEditor.TokenType.Keyword], //throw
            ["try", CodeEditor.TokenType.Keyword], //try
            ["typeof", CodeEditor.TokenType.Keyword], //typeof
            ["unchecked", CodeEditor.TokenType.Keyword], //unchecked
            ["using", CodeEditor.TokenType.Keyword], //using
            ["while", CodeEditor.TokenType.Keyword], //while
            ["new", CodeEditor.TokenType.Keyword], //new
            ["await", CodeEditor.TokenType.Keyword], //await
            ["in", CodeEditor.TokenType.Keyword], //in
            ["yield", CodeEditor.TokenType.Keyword], //yield
            ["get", CodeEditor.TokenType.Keyword], //get
            ["set", CodeEditor.TokenType.Keyword], //set
            ["when", CodeEditor.TokenType.Keyword], //when
            ["out", CodeEditor.TokenType.Keyword], //out
            ["ref", CodeEditor.TokenType.Keyword], //ref
            ["from", CodeEditor.TokenType.Keyword], //from
            ["where", CodeEditor.TokenType.Keyword], //where
            ["select", CodeEditor.TokenType.Keyword], //select
            ["record", CodeEditor.TokenType.Keyword], //record
            ["init", CodeEditor.TokenType.Keyword], //init
            ["with", CodeEditor.TokenType.Keyword], //with
            ["let", CodeEditor.TokenType.Keyword], //let
            ["var", CodeEditor.TokenType.Keyword], //this
            ["this", CodeEditor.TokenType.Keyword], //this
        ]);

    public IsLeafNode(node: CodeEditor.TSSyntaxNode): boolean {
        let type = node.type;
        return type == "modifier" || type == "string_literal" || type == "character_literal";
    }

    public GetTokenType(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        let type = node.type;
        if (type == "Error")
            return CodeEditor.TokenType.Unknown;

        if (!node.isNamed()) {
            let res: Nullable<CodeEditor.TokenType> = CSharpLanguage.TokenMap.get(type);
            return res ?? CodeEditor.TokenType.Unknown;
        }

        // is named node
        switch (type) {
            case "identifier":
                return CSharpLanguage.GetIdentifierTokenType(node);

            case "implicit_type":
            case "pointer_type":
            case "function_pointer_type":
            case "predefined_type":
                return CodeEditor.TokenType.BuiltinType;

            case "real_literal":
            case "integer_literal":
                return CodeEditor.TokenType.LiteralNumber;

            case "string_literal":
            case "character_literal":
                return CodeEditor.TokenType.LiteralString;

            case "null_literal":
            case "boolean_literal":
                return CodeEditor.TokenType.Constant;

            case "modifier":
            case "void_keyword":
                return CodeEditor.TokenType.Keyword;

            case "comment":
                return CodeEditor.TokenType.Comment;
            default:
                return CodeEditor.TokenType.Unknown;
            //throw new NotImplementedException(node.Type);
        }
    }

    private static GetIdentifierTokenType(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        let parentType = node.parent!.type;
        if (parentType == "Error")
            return CodeEditor.TokenType.Unknown;

        switch (parentType) {
            case "namespace_declaration":
            case "using_directive":
                return CodeEditor.TokenType.Module;

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
                return CodeEditor.TokenType.Type;

            case "argument":
            case "variable_declarator":
            case "property_declaration":
                return CodeEditor.TokenType.Variable;

            case "method_declaration":
                return CodeEditor.TokenType.Function;

            case "qualified_name":
                return CSharpLanguage.GetIdentifierTypeFromQualifiedName(node);
            case "member_access_expression":
                return CSharpLanguage.GetIdentifierTypeFromMemberAccess(node);

            default:
                return CodeEditor.TokenType.Unknown;
        }
    }

    private static GetIdentifierTypeFromQualifiedName(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        if (node.parent!.parent?.type == "qualified_name")
            return CodeEditor.TokenType.Module;
        if (node.parent!.parent?.type == "assignment_expression")
            return CodeEditor.TokenType.Variable; //TODO:是否静态类型的成员

        return node.nextNamedSibling == null ? CodeEditor.TokenType.Type : CodeEditor.TokenType.Module;
    }

    private static GetIdentifierTypeFromMemberAccess(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        if (node.parent!.parent!.type == "invocation_expression")
            return CodeEditor.TokenType.Function;
        //TODO:查找上下文变量列表
        return node.nextNamedSibling == null ? CodeEditor.TokenType.Variable : CodeEditor.TokenType.Type;
    }


    //参考: https://github.com/nvim-treesitter/nvim-treesitter/blob/master/queries/c_sharp/folds.scm
    private static readonly FoldQuery: string = `
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
`;

    private _foldQuery: Nullable<CodeEditor.TSQuery>;

    public GenerateFoldMarkers(document: CodeEditor.Document): Nullable<System.List<CodeEditor.FoldMarker>> {
        let syntaxParser = document.SyntaxParser;
        if (syntaxParser.RootNode == null) return null;

        this._foldQuery ??= syntaxParser.CreateQuery(CSharpLanguage.FoldQuery);
        let captures = this._foldQuery.captures(syntaxParser.RootNode);
        let lastNodeId = 0;
        let result = new System.List<CodeEditor.FoldMarker>(captures.length);
        for (const capture of captures) {
            if (lastNodeId == capture.node.id) continue;
            lastNodeId = capture.node.id;

            let node = capture.node;

            //暂跳过同一行的
            if (node.startPosition.row == node.endPosition.row) continue;

            let startIndex = node.startIndex / CodeEditor.SyntaxParser.ParserEncoding;
            let endIndex = node.endIndex / CodeEditor.SyntaxParser.ParserEncoding;

            let mark = new CodeEditor.FoldMarker(document, 0, 0, 0, 0, CodeEditor.FoldType.TypeBody, "{...}");
            mark.Offset = startIndex;
            mark.Length = endIndex - startIndex;
            result.Add(mark);
        }

        return result;
    }

}
