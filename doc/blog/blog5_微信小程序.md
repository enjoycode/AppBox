&emsp;&emsp;前一阵子帮朋友开发个微信小程序，一开始使用Wechat Devtools开发，实在受不了转用uniapp开发。后来突发奇想能否将C#写的PixUI编译成WebAssembly，由微信小程序加载运行。先上网搜了下小程序使用blazor的文章，都是用WebView包了一下blazor应用，没有参考价值，还是自己动手实现吧。

# 一、运行效果
&emsp;&emsp;演示使用C#写的LiveCharts，点击按钮动态生成一些数据。
## 1. Android真机运行
![](imgs/5_WxmpDemo.gif)

## 2. 模拟器运行
![](imgs/5_devtool.png)

# 二、实现原理

&emsp;&emsp;原理比较简单，如下图所示，将C#写的PixUI应用及C++写的Skia引擎编译为WebAssembly，然后通过微信小程序的WXWebAssembly加载，并在canvas(WebGL)通过skia绘制出用户界面，监听微信小程序的事件传给C#处理后重新绘制界面。

![](imgs/5_implemetion.png)

# 三、开发步骤

### 1. 创建wasmconsole项目
创建项目前请确认已经通过`dotnet workload install`安装`wasm-experimental`及`wasm-tools`
```shell
dotnet new wasmconsole
```

### 2. 参考PixUI.Demo.Wasm.proj修改工程文件

### 3. 使用PixUI开发用户界面

### 4. 编译并分包
因微信小程序包大小限制问题，使用`PixUI.WxmpPkgs`工具自动拆分生成pkgs目录

### 5. 将如图所示的目录及文件复制进`PixUI.Demo.Wxmp/miniprogram/dotnet目录内`
![](imgs/5_publish.png)

### 6. 修改dotnet.native.js
因微信小程序的兼容问题，以及改动了dotnet的引导代码暂需要手动修改emcc编译生成的js。
* 替换所有`import.meta.url`为`globalThis.bootUrl`;
* 搜索`receiveInstace`，将`function receiveInstance(instance,module){wasmExports=instance.exports;`替换为`function receiveInstance(instance,module){wasmExports=instance.instance.exports;`

### 7. 用Wechat Devtools打开`PixUI.Demo.Wxmp`工程即可运行


# 四、优势与劣势
## 优势
* 代码复用：前后端可以统一开发语言；
* 动态加载：可以远程加载C#写的PixUI组件；

## 劣势
* 包太大： 因打包了dotnet的mono运行时及skia引擎，目前不包含中文字体总的包大小差不多8.8MB，小程序首次加载根据网络情况会稍慢。


# 五、IOS真机问题
目前IOS真机上运行还有些问题，先在此记录。
### 1. WebAssembly不支持Exception Handling
WXWebAssembly加载时会报`invalid wasm file`错误, 暂编译不支持的版本绕过此问题。

### 2. JSC引擎的Function.length始终返回0
可以通过修改dotnet.runtime.js来绕过此问题, 搜索`argument count mismatch for cwrap`，将
```js
if(o&&n&&o.length!==n.length&&(Pe(`argument count mismatch for cwrap ${e}`),o=void 0),"function"!=typeof o&&(o=Xe.cwrap(e,t,n,r))
```
替换为
```js
if("function"!=typeof o&&(o=Xe.cwrap(e,t,n,r))
```

### 3. Jiterpreter造成微信闪退
暂通过修改dotnet.runtime.js来绕过此问题，搜索`.tableSize`，将
```js
function(){if(ds)return;ds=!0;const e=ps(),t=e.tableSize,n=ot.emscriptenBuildOptions.runAOTCompilation?e.tableSize:1,
```
替换为
```js
function(){return;if(ds)return;ds=!0;const e=ps(),t=e.tableSize,n=ot.emscriptenBuildOptions.runAOTCompilation?e.tableSize:1,
```

### 4. 报`compiling function underran the stack`错误，暂无解。**请哪位熟悉WebAssembly的大神指点一下**。

# 六、小结
&emsp;&emsp;本次尝试换种方式用自己熟悉的语言来开发微信小程序，也为AppBox快速开发框架做个用户端拓展实验。感兴趣的小伙伴可以直接clone https://github.com/enjoycode/PixUI.git ,用Wechat Devtools打开PixUI.Demo.Wxmp项目体验。如果感兴趣的小伙伴比较多，我会继续完善(包括将微信小程序的一些api用C#包装一下)。~~作者个人能力实在有限Bug在所难免，如有问题请邮件联系或Github Issue，欢迎感兴趣的小伙伴们加入共同完善，当然更欢迎赞助项目或给作者介绍工作（目前找工作中）。~~