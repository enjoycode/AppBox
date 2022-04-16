import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export interface ITokensProvider {
    IsLeafNode(node: CodeEditor.TSSyntaxNode): boolean;

    GetTokenType(node: CodeEditor.TSSyntaxNode): CodeEditor.TokenType;
}
