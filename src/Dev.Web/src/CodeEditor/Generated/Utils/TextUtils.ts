import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class TextUtils {
    private static readonly ZwjUtf16: any = (Math.floor(0x200D) & 0xFF);

    private static IsUtf16Surrogate(value: any): boolean {
        return (value & 0xF800) == 0xD800;
    }

    private static IsUnicodeDirectionality(value: any): boolean {
        return value == 0x200F || value == 0x200E;
    }

    public static IsMultiCodeUnit(codeUnit: any): boolean {
        return TextUtils.IsUtf16Surrogate(codeUnit) ||
            codeUnit == TextUtils.ZwjUtf16 ||
            TextUtils.IsUnicodeDirectionality(codeUnit);
    }
}
