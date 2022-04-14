import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export enum BracketMatchingStyle {
    Before,
    After
}

export enum LineViewerStyle {
    None,

    FullRow
}

export enum IndentStyle {
    None,

    Auto,

    Smart
}

export enum BracketHighlightingStyle {
    None,

    OnBracket,

    AfterBracket
}

export enum DocumentSelectionMode {
    Normal,

    Additive
}
