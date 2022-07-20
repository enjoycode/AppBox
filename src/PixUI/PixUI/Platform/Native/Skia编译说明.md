https://skia.org/docs/user/build/

# 修改GN包含SkParagraph及相关C-Api

# 编译Skia

## MacOS

```bash
bin/gn gen out/macos-x86_64 --args='target_os="mac" target_cpu="x86_64" is_official_build=true is_component_build=true skia_use_gl=false skia_use_vulkan=false skia_enable_tools=false skia_enable_pdf=true skia_pdf_subset_harfbuzz=true skia_use_zlib=true skia_use_icu=true skia_use_harfbuzz=true skia_use_metal=true skia_use_piex=true skia_use_sfntly=false skia_use_system_icu=false skia_use_system_harfbuzz=false skia_use_system_expat=false skia_use_system_libjpeg_turbo=false skia_use_system_libpng=false skia_use_system_libwebp=false skia_use_system_zlib=false extra_cflags=[ "-DSKIA_C_DLL", "-DHAVE_ARC4RANDOM_BUF", "-stdlib=libc++", "--target=x86_64-apple-macos10.15" ] extra_ldflags=[ "-stdlib=libc++", "--target=x86_64-apple-macos10.15" ] '
```

注意M1编译x86_64使用以下方式：
将上述命令建一个shell脚本

```bash
arch -x86_64 ./build.sh
arch -x86_64 ninja -C out/macos-x86_64 skia
```

## Windows

**注意: 命令行操作用Command不要用PowerShell**

* 禁用系统Python:

  Settings > Manage App Execution Aliases 关闭python installer

* 安装 depot_tools:

  https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up
  安装完执行一下

```shell
gclient
```

* 安装 VisualStudio:

  arm需要2022 preview 2之后版本，且需要单独安装Visual C++ compilers and libraries for ARM64

* 编译

先同步skia第三方依赖:
```shell
python3 tools/git-sync-deps
```

```bash
bin\gn gen out/win-arm64 --args="target_cpu=\"arm64\" is_official_build=true is_component_build=true skia_use_gl=true skia_use_metal=false skia_use_vulkan=false skia_use_angle=true skia_enable_tools=false skia_use_xps=false skia_enable_pdf=true skia_pdf_subset_harfbuzz=true skia_use_zlib=true skia_use_icu=true skia_use_harfbuzz=true skia_use_piex=false skia_use_dng_sdk=false skia_use_sfntly=false skia_use_system_icu=false skia_use_system_harfbuzz=false skia_use_system_expat=false skia_use_system_libjpeg_turbo=false skia_use_system_libpng=false skia_use_system_libwebp=false skia_use_system_zlib=false skia_enable_fontmgr_win=true skia_enable_fontmgr_win_gdi=true extra_cflags=[\"-DSKIA_C_DLL\"]"
ninja -C out/win-arm64 skia
```

注意: skia_use_gl=true skia_use_angle=true