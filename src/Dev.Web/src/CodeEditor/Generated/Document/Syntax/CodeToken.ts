export enum TokenType {
    Unknown,
    WhiteSpace,
    Error,

    Module,
    Type,
    BuiltinType,

    LiteralNumber,
    LiteralString,
    Constant,

    Keyword,
    Comment,
    PunctuationDelimiter,
    PunctuationBracket,
    Operator,
    Variable,
    Function
}

export class CodeToken {
    public static Make(type: TokenType, startColumn: number): number {
        return ((Math.floor(type) & 0xFFFFFFFF) << 24) | startColumn;
    }

    public static GetTokenStartColumn(token: number): number {
        return token & 0xFFFFFF;
    }

    public static GetTokenType(token: number): TokenType {
        return <TokenType><unknown>(token >> 24);
    }

}
