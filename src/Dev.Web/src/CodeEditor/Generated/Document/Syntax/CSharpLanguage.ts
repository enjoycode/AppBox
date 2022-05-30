import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class CSharpLanguage implements CodeEditor.ICodeLanguage {

    private static readonly TokenMap: System.StringMap<CodeEditor.TokenType> = new System.StringMap<CodeEditor.TokenType>([[";", CodeEditor.TokenType.PunctuationDelimiter], [".", CodeEditor.TokenType.PunctuationDelimiter], [",", CodeEditor.TokenType.PunctuationDelimiter], ["--", CodeEditor.TokenType.Operator], ["-", CodeEditor.TokenType.Operator], ["-=", CodeEditor.TokenType.Operator], ["&", CodeEditor.TokenType.Operator], ["&&", CodeEditor.TokenType.Operator], ["+", CodeEditor.TokenType.Operator], ["++", CodeEditor.TokenType.Operator], ["+=", CodeEditor.TokenType.Operator], ["<", CodeEditor.TokenType.Operator], ["<<", CodeEditor.TokenType.Operator], ["=", CodeEditor.TokenType.Operator], ["==", CodeEditor.TokenType.Operator], ["!", CodeEditor.TokenType.Operator], ["!=", CodeEditor.TokenType.Operator], ["=>", CodeEditor.TokenType.Operator], [">", CodeEditor.TokenType.Operator], [">>", CodeEditor.TokenType.Operator], ["|", CodeEditor.TokenType.Operator], ["||", CodeEditor.TokenType.Operator], ["?", CodeEditor.TokenType.Operator], ["??", CodeEditor.TokenType.Operator], ["^", CodeEditor.TokenType.Operator], ["~", CodeEditor.TokenType.Operator], ["*", CodeEditor.TokenType.Operator], ["/", CodeEditor.TokenType.Operator], ["%", CodeEditor.TokenType.Operator], [":", CodeEditor.TokenType.Operator], ["(", CodeEditor.TokenType.PunctuationBracket], [")", CodeEditor.TokenType.PunctuationBracket], ["[", CodeEditor.TokenType.PunctuationBracket], ["]", CodeEditor.TokenType.PunctuationBracket], ["{", CodeEditor.TokenType.PunctuationBracket], ["}", CodeEditor.TokenType.PunctuationBracket], ["as", CodeEditor.TokenType.Keyword], ["base", CodeEditor.TokenType.Keyword], ["break", CodeEditor.TokenType.Keyword], ["case", CodeEditor.TokenType.Keyword], ["catch", CodeEditor.TokenType.Keyword], ["checked", CodeEditor.TokenType.Keyword], ["class", CodeEditor.TokenType.Keyword], ["continue", CodeEditor.TokenType.Keyword], ["default", CodeEditor.TokenType.Keyword], ["delegate", CodeEditor.TokenType.Keyword], ["do", CodeEditor.TokenType.Keyword], ["else", CodeEditor.TokenType.Keyword], ["enum", CodeEditor.TokenType.Keyword], ["event", CodeEditor.TokenType.Keyword], ["explicit", CodeEditor.TokenType.Keyword], ["finally", CodeEditor.TokenType.Keyword], ["for", CodeEditor.TokenType.Keyword], ["foreach", CodeEditor.TokenType.Keyword], ["goto", CodeEditor.TokenType.Keyword], ["if", CodeEditor.TokenType.Keyword], ["implicit", CodeEditor.TokenType.Keyword], ["interface", CodeEditor.TokenType.Keyword], ["is", CodeEditor.TokenType.Keyword], ["lock", CodeEditor.TokenType.Keyword], ["namespace", CodeEditor.TokenType.Keyword], ["operator", CodeEditor.TokenType.Keyword], ["params", CodeEditor.TokenType.Keyword], ["return", CodeEditor.TokenType.Keyword], ["sizeof", CodeEditor.TokenType.Keyword], ["stackalloc", CodeEditor.TokenType.Keyword], ["struct", CodeEditor.TokenType.Keyword], ["switch", CodeEditor.TokenType.Keyword], ["throw", CodeEditor.TokenType.Keyword], ["try", CodeEditor.TokenType.Keyword], ["typeof", CodeEditor.TokenType.Keyword], ["unchecked", CodeEditor.TokenType.Keyword], ["using", CodeEditor.TokenType.Keyword], ["while", CodeEditor.TokenType.Keyword], ["new", CodeEditor.TokenType.Keyword], ["await", CodeEditor.TokenType.Keyword], ["in", CodeEditor.TokenType.Keyword], ["yield", CodeEditor.TokenType.Keyword], ["get", CodeEditor.TokenType.Keyword], ["set", CodeEditor.TokenType.Keyword], ["when", CodeEditor.TokenType.Keyword], ["out", CodeEditor.TokenType.Keyword], ["ref", CodeEditor.TokenType.Keyword], ["from", CodeEditor.TokenType.Keyword], ["where", CodeEditor.TokenType.Keyword], ["select", CodeEditor.TokenType.Keyword], ["record", CodeEditor.TokenType.Keyword], ["init", CodeEditor.TokenType.Keyword], ["with", CodeEditor.TokenType.Keyword], ["let", CodeEditor.TokenType.Keyword], ["this", CodeEditor.TokenType.Keyword], ["var", CodeEditor.TokenType.Keyword]]);

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
        if (node.parent.parent.type == "qualified_name")
            return CodeEditor.TokenType.Module;
        
        return node.nextNamedSibling == null ? CodeEditor.TokenType.Type : CodeEditor.TokenType.Module;
    }

    private static GetIdentifierTypeFromMemberAccess(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        if (node.parent!.parent!.type == "invocation_expression")
            return CodeEditor.TokenType.Function;
        if (node.parent!.parent!.type == "assignment_expression")
            return CodeEditor.TokenType.Variable; //TODO:是否静态类型的成员

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

    public Init(props: Partial<CSharpLanguage>): CSharpLanguage {
        Object.assign(this, props);
        return this;
    }

}
