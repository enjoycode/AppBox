export class TextUtils {
    private static readonly ZwjUtf16: number = (Math.floor(0x200D) & 0xFF);

    private static IsUtf16Surrogate(value: number): boolean {
        return (value & 0xF800) == 0xD800;
    }

    private static IsUnicodeDirectionality(value: number): boolean {
        return value == 0x200F || value == 0x200E;
    }

    public static IsMultiCodeUnit(codeUnit: number): boolean {
        return TextUtils.IsUtf16Surrogate(codeUnit) ||
            codeUnit == TextUtils.ZwjUtf16 ||
            TextUtils.IsUnicodeDirectionality(codeUnit);
    }
}
