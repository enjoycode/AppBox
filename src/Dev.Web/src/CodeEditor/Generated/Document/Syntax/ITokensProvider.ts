import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export interface ITokensProvider {
    IsLeafNode(node: TreeSitter.SyntaxNode): boolean;

    GetTokenType(node: TreeSitter.SyntaxNode): CodeEditor.TokenType;
}
