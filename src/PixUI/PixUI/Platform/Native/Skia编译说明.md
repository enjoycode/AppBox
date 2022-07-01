# 修改GN包含SkParagraph及相关C-Api

# 编译Skia

### MacOS

```bash
bin/gn gen out/macos/x86_64 --args='target_os="mac" target_cpu="x86_64" is_official_build=true is_component_build=true skia_use_gl=false skia_use_vulkan=false skia_enable_tools=false skia_enable_pdf=true skia_pdf_subset_harfbuzz=true skia_use_zlib=true skia_use_icu=true skia_use_harfbuzz=true skia_use_metal=true skia_use_piex=true skia_use_sfntly=false skia_use_system_icu=false skia_use_system_harfbuzz=false skia_use_system_expat=false skia_use_system_libjpeg_turbo=false skia_use_system_libpng=false skia_use_system_libwebp=false skia_use_system_zlib=false extra_cflags=[ "-DSKIA_C_DLL", "-DHAVE_ARC4RANDOM_BUF", "-stdlib=libc++", "--target=x86_64-apple-macos10.12" ] extra_ldflags=[ "-stdlib=libc++", "--target=x86_64-apple-macos10.12" ] '
```

注意M1编译x86_64使用以下方式：

```bash
arch -x86_64 bin/gn gen out/macos/x86_64 --args="..."
arch -x86_64 ninja -C out/macos/x86_64 skia
```