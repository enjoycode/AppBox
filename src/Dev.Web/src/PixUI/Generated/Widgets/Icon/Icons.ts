import * as PixUI from '@/PixUI'

export class Icons {
    // https://fonts.google.com/icons?selected=Material+Icons
    // https://github.com/google/material-design-icons/tree/master/font
    // 字体格式转换 brew install woff2 https://github.com/google/woff2
    //      woff2_compress myfont.ttf
    //      woff2_decompress myfont.woff2

    public static readonly Filled: PixUI.MaterialIcons = new PixUI.MaterialIcons();

    public static readonly Outlined: PixUI.MaterialIconsOutlined = new PixUI.MaterialIconsOutlined();
}
