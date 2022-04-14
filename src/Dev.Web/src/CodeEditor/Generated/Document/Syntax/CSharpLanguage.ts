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

    //TODO:考虑数组映射
    private static readonly TokenMap: System.Dictionary<number, CodeEditor.TokenType> = new System.Dictionary<number, CodeEditor.TokenType>();


    public IsLeafNode(node: TreeSitter.SyntaxNode): boolean {
        return node.typeId == <number><any>CSharpSymbol.Modifier ||
            node.typeId == <number><any>CSharpSymbol.StringLiteral ||
            node.typeId == <number><any>CSharpSymbol.CharacterLiteral;
    }

    public GetTokenType(node: TreeSitter.SyntaxNode): CodeEditor.TokenType {
        if (node.typeId == number.MaxValue) //IsError
            return CodeEditor.TokenType.Unknown;

        if (!node.isNamed())
            return CSharpLanguage.TokenMap.TryGetValue(node.typeId, CodeEditor.var
        type
    )
            ? type : CodeEditor.TokenType.Unknown;

        // is named node
        switch (node.typeId) {
            case <number><any>CSharpSymbol.Identifier:
                return this.GetIdentifierTokenType(node);

            case <number><any>CSharpSymbol.ImplicitType:
            case <number><any>CSharpSymbol.PointerType:
            case <number><any>CSharpSymbol.FunctionPointerType:
            case <number><any>CSharpSymbol.PredefinedType:
                return CodeEditor.TokenType.BuiltinType;

            case <number><any>CSharpSymbol.RealLiteral:
            case <number><any>CSharpSymbol.IntegerLiteral:
                return CodeEditor.TokenType.LiteralNumber;

            case <number><any>CSharpSymbol.StringLiteral:
            case <number><any>CSharpSymbol.CharacterLiteral:
                return CodeEditor.TokenType.LiteralString;

            case <number><any>CSharpSymbol.NullLiteral:
            case <number><any>CSharpSymbol.BooleanLiteral:
                return CodeEditor.TokenType.Constant;

            case <number><any>CSharpSymbol.Modifier:
            case <number><any>CSharpSymbol.VoidKeyword:
                return CodeEditor.TokenType.Keyword;

            case <number><any>CSharpSymbol.Comment:
                return CodeEditor.TokenType.Comment;
            default:
                throw new System.NotImplementedException(node.type);
        }
    }

    private GetIdentifierTokenType(node: TreeSitter.SyntaxNode): CodeEditor.TokenType {
        if (node.parent!.typeId == number.MaxValue) //IsError
            return CodeEditor.TokenType.Unknown;

        switch (node.parent!.typeId) {
            case <number><any>CSharpSymbol.ClassDeclaration:
            case <number><any>CSharpSymbol.InterfaceDeclaration:
            case <number><any>CSharpSymbol.EnumDeclaration:
            case <number><any>CSharpSymbol.StructDeclaration:
            case <number><any>CSharpSymbol.RecordDeclaration:
            case <number><any>CSharpSymbol.NamespaceDeclaration:
                return CodeEditor.TokenType.Type;

            case <number><any>CSharpSymbol.Argument:
            case <number><any>CSharpSymbol.VariableDeclarator:
            case <number><any>CSharpSymbol.PropertyDeclaration:
                return CodeEditor.TokenType.Variable;

            case <number><any>CSharpSymbol.MethodDeclaration:
                return CodeEditor.TokenType.Function;

            case <number><any>CSharpSymbol.MemberAccessExpression:
                return this.GetMemberAccessTokenType(node.parent);

            default:
                return CodeEditor.TokenType.Unknown;
        }
    }

    private GetMemberAccessTokenType(node: TreeSitter.SyntaxNode): CodeEditor.TokenType {
        if (node.parent!.typeId == <number><any>CSharpSymbol.InvocationExpression)
            return CodeEditor.TokenType.Function;

        return CodeEditor.TokenType.Type; //TODO:
    }


    //参考: https://github.com/nvim-treesitter/nvim-treesitter/blob/master/queries/c_sharp/folds.scm
    private static readonly FoldQuery: string = @"
    body: [
        (declaration_list)
(
    switch_body
)
(
    enum_member_declaration_list
)
]
    @fold

    accessors: [
        (accessor_list)
    ]
    @fold

    initializer: [
        (initializer_expression)
    ]
    @fold

    (block) @fold
    ";

    private _foldQuery: Nullable<TreeSitter.Query>;

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
