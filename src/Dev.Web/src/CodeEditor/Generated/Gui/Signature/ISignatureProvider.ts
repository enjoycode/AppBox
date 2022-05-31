import * as CodeEditor from '@/CodeEditor'
import * as System from '@/System'

export interface ISignatureParameter {
    get Name(): string;

    get Label(): string;

    get Documentation(): Nullable<string>;

}

export interface ISignatureItem {
    get Name(): string;

    get Label(): string;

    get Documentation(): Nullable<string>;

    get Parameters(): System.IEnumerable<ISignatureParameter>;

}

export interface ISignatureResult {
    get ActiveSignature(): number;

    get ActiveParameter(): number;

    get Signatures(): System.IEnumerable<ISignatureItem>;

}

export interface ISignatureProvider {
    get TriggerCharacters(): System.IEnumerable<number>;


    ProvideSignatures(document: CodeEditor.Document, offset: number): System.Task<Nullable<ISignatureResult>>;
}
