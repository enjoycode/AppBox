import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export enum CSharpSymbol {
    //----type---
    ConstructorDeclaration = 236,
    MethodDeclaration = 248,
    EnumDeclaration = 264,
    ClassDeclaration = 268,
    InterfaceDeclaration = 270,
    StructDeclaration = 271,
    RecordDeclaration = 273,
    NamespaceDeclaration = 278,

    //----builtin type----
    ImplicitType = 281,
    NullableType = 284,
    PointerType = 286,
    FunctionPointerType = 287,
    PredefinedType = 98,

    //----@property.definition----
    EnumMemberDeclaration = 267,

    //----@number----
    RealLiteral = 176,
    IntegerLiteral = 174,

    //----@string----
    CharacterLiteral = 419,
    StringLiteral = 420,
    VerbatimStringLiteral = 178,
    InterpolatedStringText = 369,
    InterpolatedVerbatimStringText = 370,

    //----@constant.builtin----
    NullLiteral = 175,
    BooleanLiteral = 418,
    VoidKeyword = 182,

    //----@comment----
    Comment = 179,

    Identifier = 415,

    //----@keyword----
    Modifier = 228,
    ThisExpression = 365,
    EscapeSequence = 173,

    QualifiedName = 219,
    VariableDeclarator = 230,
    Argument = 233,
    PropertyDeclaration = 263,
    InvocationExpression = 374,
    MemberAccessExpression = 377
}

export class CSharpLanguage implements CodeEditor.ICodeLanguage {
    private static readonly ErrorTypeId: number = 0xFFFF;


    //TODO:考虑数组映射
    private static readonly TokenMap: System.NumberMap<CodeEditor.TokenType> = new System.NumberMap<CodeEditor.TokenType>([[4, CodeEditor.TokenType.PunctuationDelimiter], [13, CodeEditor.TokenType.PunctuationDelimiter], [11, CodeEditor.TokenType.PunctuationDelimiter], [65, CodeEditor.TokenType.Operator], [69, CodeEditor.TokenType.Operator], [126, CodeEditor.TokenType.Operator], [75, CodeEditor.TokenType.Operator], [167, CodeEditor.TokenType.Operator], [68, CodeEditor.TokenType.Operator], [64, CodeEditor.TokenType.Operator], [125, CodeEditor.TokenType.Operator], [10, CodeEditor.TokenType.Operator], [76, CodeEditor.TokenType.Operator], [8, CodeEditor.TokenType.Operator], [78, CodeEditor.TokenType.Operator], [63, CodeEditor.TokenType.Operator], [79, CodeEditor.TokenType.Operator], [52, CodeEditor.TokenType.Operator], [12, CodeEditor.TokenType.Operator], [77, CodeEditor.TokenType.Operator], [74, CodeEditor.TokenType.Operator], [168, CodeEditor.TokenType.Operator], [59, CodeEditor.TokenType.Operator], [169, CodeEditor.TokenType.Operator], [73, CodeEditor.TokenType.Operator], [56, CodeEditor.TokenType.Operator], [70, CodeEditor.TokenType.Operator], [71, CodeEditor.TokenType.Operator], [72, CodeEditor.TokenType.Operator], [23, CodeEditor.TokenType.Operator], [24, CodeEditor.TokenType.PunctuationBracket], [25, CodeEditor.TokenType.PunctuationBracket], [14, CodeEditor.TokenType.PunctuationBracket], [15, CodeEditor.TokenType.PunctuationBracket], [50, CodeEditor.TokenType.PunctuationBracket], [51, CodeEditor.TokenType.PunctuationBracket], [170, CodeEditor.TokenType.Keyword], [49, CodeEditor.TokenType.Keyword], [99, CodeEditor.TokenType.Keyword], [109, CodeEditor.TokenType.Keyword], [122, CodeEditor.TokenType.Keyword], [100, CodeEditor.TokenType.Keyword], [58, CodeEditor.TokenType.Keyword], [102, CodeEditor.TokenType.Keyword], [110, CodeEditor.TokenType.Keyword], [89, CodeEditor.TokenType.Keyword], [103, CodeEditor.TokenType.Keyword], [112, CodeEditor.TokenType.Keyword], [87, CodeEditor.TokenType.Keyword], [17, CodeEditor.TokenType.Keyword], [54, CodeEditor.TokenType.Keyword], [123, CodeEditor.TokenType.Keyword], [105, CodeEditor.TokenType.Keyword], [107, CodeEditor.TokenType.Keyword], [108, CodeEditor.TokenType.Keyword], [111, CodeEditor.TokenType.Keyword], [53, CodeEditor.TokenType.Keyword], [88, CodeEditor.TokenType.Keyword], [146, CodeEditor.TokenType.Keyword], [113, CodeEditor.TokenType.Keyword], [91, CodeEditor.TokenType.Keyword], [55, CodeEditor.TokenType.Keyword], [48, CodeEditor.TokenType.Keyword], [21, CodeEditor.TokenType.Keyword], [164, CodeEditor.TokenType.Keyword], [136, CodeEditor.TokenType.Keyword], [60, CodeEditor.TokenType.Keyword], [114, CodeEditor.TokenType.Keyword], [120, CodeEditor.TokenType.Keyword], [121, CodeEditor.TokenType.Keyword], [165, CodeEditor.TokenType.Keyword], [101, CodeEditor.TokenType.Keyword], [6, CodeEditor.TokenType.Keyword], [104, CodeEditor.TokenType.Keyword], [33, CodeEditor.TokenType.Keyword], [106, CodeEditor.TokenType.Keyword], [46, CodeEditor.TokenType.Keyword], [124, CodeEditor.TokenType.Keyword], [82, CodeEditor.TokenType.Keyword], [83, CodeEditor.TokenType.Keyword], [119, CodeEditor.TokenType.Keyword], [45, CodeEditor.TokenType.Keyword], [40, CodeEditor.TokenType.Keyword], [149, CodeEditor.TokenType.Keyword], [57, CodeEditor.TokenType.Keyword], [160, CodeEditor.TokenType.Keyword], [90, CodeEditor.TokenType.Keyword], [86, CodeEditor.TokenType.Keyword], [166, CodeEditor.TokenType.Keyword], [154, CodeEditor.TokenType.Keyword]]);

    public IsLeafNode(node: CodeEditor.TSSyntaxNode): boolean {
        return node.typeId == <number>CSharpSymbol.Modifier ||
            node.typeId == <number>CSharpSymbol.StringLiteral ||
            node.typeId == <number>CSharpSymbol.CharacterLiteral;
    }

    public GetTokenType(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        if (node.typeId == CSharpLanguage.ErrorTypeId) //IsError
            return CodeEditor.TokenType.Unknown;

        if (!node.isNamed()) {
            let res: Nullable<CodeEditor.TokenType> = CSharpLanguage.TokenMap.get(node.typeId);
            return res ?? CodeEditor.TokenType.Unknown;
        }

        // is named node
        switch (node.typeId) {
            case <number>CSharpSymbol.Identifier:
                return this.GetIdentifierTokenType(node);

            case <number>CSharpSymbol.ImplicitType:
            case <number>CSharpSymbol.PointerType:
            case <number>CSharpSymbol.FunctionPointerType:
            case <number>CSharpSymbol.PredefinedType:
                return CodeEditor.TokenType.BuiltinType;

            case <number>CSharpSymbol.RealLiteral:
            case <number>CSharpSymbol.IntegerLiteral:
                return CodeEditor.TokenType.LiteralNumber;

            case <number>CSharpSymbol.StringLiteral:
            case <number>CSharpSymbol.CharacterLiteral:
                return CodeEditor.TokenType.LiteralString;

            case <number>CSharpSymbol.NullLiteral:
            case <number>CSharpSymbol.BooleanLiteral:
                return CodeEditor.TokenType.Constant;

            case <number>CSharpSymbol.Modifier:
            case <number>CSharpSymbol.VoidKeyword:
                return CodeEditor.TokenType.Keyword;

            case <number>CSharpSymbol.Comment:
                return CodeEditor.TokenType.Comment;
            default:
                return CodeEditor.TokenType.Unknown;
            //throw new NotImplementedException(node.Type);
        }
    }

    private GetIdentifierTokenType(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        if (node.parent!.typeId == CSharpLanguage.ErrorTypeId)
            return CodeEditor.TokenType.Unknown;

        switch (node.parent!.typeId) {
            case <number>CSharpSymbol.ClassDeclaration:
            case <number>CSharpSymbol.InterfaceDeclaration:
            case <number>CSharpSymbol.EnumDeclaration:
            case <number>CSharpSymbol.StructDeclaration:
            case <number>CSharpSymbol.RecordDeclaration:
            case <number>CSharpSymbol.NamespaceDeclaration:
                return CodeEditor.TokenType.Type;

            case <number>CSharpSymbol.Argument:
            case <number>CSharpSymbol.VariableDeclarator:
            case <number>CSharpSymbol.PropertyDeclaration:
                return CodeEditor.TokenType.Variable;

            case <number>CSharpSymbol.MethodDeclaration:
                return CodeEditor.TokenType.Function;

            case <number>CSharpSymbol.MemberAccessExpression:
                return this.GetMemberAccessTokenType(node.parent);

            default:
                return CodeEditor.TokenType.Unknown;
        }
    }

    private GetMemberAccessTokenType(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType {
        if (node.parent!.typeId == <number>CSharpSymbol.InvocationExpression)
            return CodeEditor.TokenType.Function;

        return CodeEditor.TokenType.Type; //TODO:
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

            let startIndex = node.startIndex / 2;
            let endIndex = node.endIndex / 2;

            let mark = new CodeEditor.FoldMarker(document, 0, 0, 0, 0, CodeEditor.FoldType.TypeBody, "{...}");
            mark.Offset = startIndex;
            mark.Length = endIndex - startIndex;
            if (mark.StartLine != mark.EndLine)
                result.Add(mark);

            // var startPos = node.StartPosition;
            // var endPos = node.EndPosition;
            // if (startPos.Row == endPos.Row) continue; //暂跳过同一行的
            //
            // //TODO: fix FoldType
            // var mark = new FoldMarker(document, (int)startPos.Row, (int)startPos.Column / 2,
            //     (int)endPos.Row, (int)endPos.Column / 2, FoldType.MemberBody);
            // result.Add(mark);
        }

        return result;
    }

    public Init(props: Partial<CSharpLanguage>): CSharpLanguage {
        Object.assign(this, props);
        return this;
    }

}
