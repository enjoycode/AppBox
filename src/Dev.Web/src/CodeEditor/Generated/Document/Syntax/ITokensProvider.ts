import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export interface ITokensProvider {
    IsLeafNode(node: CodeEditor.SyntaxNode): boolean;

    GetTokenType(node: CodeEditor.SyntaxNode): CodeEditor.TokenType;
}
