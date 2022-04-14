import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export enum TokenType {
    Unknown,
    WhiteSpace,
    Error,

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
        return (<number><any>type << 24) | startColumn;
    }

    public static GetTokenStartColumn(token: number): number {
        return token & 0xFFFFFF;
    }

    public static GetTokenType(token: number): TokenType {
        return <TokenType><any>(token >> 24);
    }

}
