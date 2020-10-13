
---
title: Web 端 H265 播放器实现(FFmpeg+ WebAssembly)
---

### 环境准备
* emsdk
* ffmpeg
* cmake
* python
具体环境看实际情况，操作中我是用 docker 的 debian 环境安装的


### 流程
安装 emsdk、cmake 等基础环境 => clone ffmpeg 源码 => 根据实际需求从源码编译 ffmpeg => 编译 ffmpeg 到 WebAssembly => 浏览器调用 => 转码 => 渲染到 Canvas、同步播放音频 => 播放器 UI 开发 => 完成

安装基础依赖
```shell
# 安装 git
apt install git-all

# 如果系统缺少 python，安装 python，2 3 都安装一下
apt install python
apt install python3

# 如果系统没有 gcc 也安装一下，有就无所了
apt install gcc

# yasm 同理
apt install yasm

# 如果没有 node 也顺带安装一下
apt install nodejs

# 目前 linux 上安装 node 好像不自带 npm 了，也需要安装一下
apt install npm
```

第一次安装可能提示找不到包，直接 `apt update` 更新一下 apt 再重新安装即可

安装 cmark
``` shell
apt install cmake
```

接着安装 emsdk
``` shell
# 找个地方存放 emsdk 源码
git clone https://github.com/juj/emsdk 
cd emsdk 

# 开始安装
./emsdk install latest

# 激活
./emsdk activate latest
	
# 配置环境变量，每次需要编译的时候配置一次
source ./emsdk_env.sh
	
# 校验编译成功，看到输出使用帮助信息代表安装成功
emcc --help
```

编译 ffmpeg
```
# 找个地方存放 ffmpeg 的源码
git clone https://github.com/FFmpeg/FFmpeg ffmpeg
cd ffmpeg
```

接下来可以写个编译配置脚本

```
touch make.sh

vim ./make.sh


# 复制下面的进脚本里

#!/bin/bash -x

# verify Emscripten version
emcc -v
make clean
# configure FFMpeg with Emscripten
CFLAGS="-s USE_PTHREADS"
CPPFLAGS="-D_POSIX_C_SOURCE=200112 -D_XOPEN_SOURCE=600"
LDFLAGS="$CFLAGS -s INITIAL_MEMORY=256*1024*1024"
ARGS=(
    --cc="emcc"
    --disable-stripping
    --prefix=$(pwd)/../dist
    --enable-cross-compile
    --target-os=none
    --arch=x86_64
    --cpu=generic
    --disable-ffplay
    --disable-ffprobe
    --disable-asm
    --disable-doc
    --disable-devices
    --disable-pthreads
    --disable-w32threads
    --disable-network
    --disable-hwaccels
    --disable-parsers
    --disable-bsfs
    --disable-debug
    --disable-protocols
    --disable-indevs
    --disable-outdevs
    --enable-protocol=file
    --ranlib="emranlib"
)

emconfigure ./configure "${ARGS[@]}"

# build ffmpeg.wasm
emmake make -j
make install
# 接着保存这个脚本
```

随后给脚本赋予权限
```
chmod u+x make.sh
```

如果中间出现什么内存过小的问题，去 `emsdk/upstream/emscripten/src/settings.js` 里修改 init memory 

- - - -
> 注意，以下很可能是错误的操作流程，因为我并没有跑通这个流程，仅供参考。结尾部分有跑通的操作流程  

这个时候进入之前设置的 `$(pwd)/../dist` 文件夹，里面会有几个文件夹，进入 `bin` 文件夹里， ffmpeg 文件就是编译后的成果

接着需要两个钩子文件，`ffmpeg_pre.js` 和 `ffmpeg_post.js`
参考了这里
[videoconverter.js](https://github.com/bgrins/videoconverter.js/tree/master/build)
实际钩子文件需要根据需求自行编写。


接着依旧编写一个 `bash.sh ` 来帮我们执行命令
```
# 改名
cp ffmpeg ffmpeg.bc
emcc -s ASSERTIONS=1 -s VERBOSE=1 -s TOTAL_MEMORY=256mb -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -O2 -v ffmpeg.bc -o ./ffmpeg.js --pre-js ./ffmpeg_pre.js --post-js ./ffmpeg_post.js
```

很遗憾的是截至目前我编译失败了
`wasm-ld: error: unknown file type: ffmpeg.bc`

我在 github 查看到了这个 bug，目前开发人员还没有进行回复
[BUG unknown file type · Issue #12344 · emscripten-core/emscripten · GitHub](https://github.com/emscripten-core/emscripten/issues/12344)

等有解决方案再更新吧

不过我认为通过 post.js 去不断的和 wasm 交互可能并不是很合适，事实上是可以写个 c 程序，编译一下成为 wasm 来调用 ffmpeg，之后 js 只需要保持和 c 的通信传输数据即可，但是目前没办法实验了，找遍了全网也没有这个错误的解决方案，只能等待后续 github 上更新解决方法。

不过我发现了这个库 [GitHub - goldvideo/h265player: Web 版 H265 播放器，基于 JS 解封装、WebAssembly(FFmpeg) 解码，利用 Canvas 投影、AudioContext 播放音频。](https://github.com/goldvideo/h265player)，这两天打算尝试一下这个别人封装好的库怎么样

- - - -
### 更新
今天看了开发人员的回复，又重新搜了一下资料，才发现之前的编译根本就是错的，之前编译出来的 ffmpeg 就是一个可执行文件，不是用来再次编译的。

> sbc100: ffmpeg is an executable not a library, and emscripten generated JavaScript executables so ffmpeg is a JavaScript file and this cannot then be linked into another applications.  
I assume you are trying to use ffmpeg as a library? If so you probably want to instead link your program against libavcodec.a and other libraries that are part of ffmpeg.

正确的编译方式应该是编译生成的 lib 文件下的文件，大概有这几个，同时尝试一下用 c 来调用 ffmpeg，目前正在尝试中…
* libavcodec - 音视频编解码 
* libavformat - 音视频解封装
* libavutil - 工具函数
* libswscale - 图像缩放&色彩转换


随后我发现了这个文章，[前端视频帧提取 ffmpeg + Webassembly](https://juejin.im/post/6854573219454844935) 里面提到了用 c 来调用 ffmpeg 的形式，按照他的步骤我尝试了一下竟然编译成功了，正如我之前所说的，需要编译进去的是这几个文件：libavcodec、libavformat、libavutil、libswscale，而不是之前那个 ffmpeg 文件

- - - -
### 参考
* [前端视频帧提取 ffmpeg + Webassembly](https://juejin.im/post/6854573219454844935) 
* [wasm + ffmpeg实现前端截取视频帧功能 – 会编程的银猪](https://www.yinchengli.com/2018/07/28/wasm-ffmpeg-get-video-frame/comment-page-1/)
* [使用WebAssembly+FFmpeg实现前端视频转码(上) - 知乎](https://zhuanlan.zhihu.com/p/27874253)
* [WebAssembly 編譯ffmpeg 進行串流(構想與實現? - Coding の ORZ](https://x8795278.blogspot.com/2019/07/webassembly-ffmpeg.html)
* [使用Emscripten编译ffmpeg库(.bc)_weixin_42651102的博客-CSDN博客](https://blog.csdn.net/weixin_42651102/article/details/107129187)
* [GitHub - goldvideo/h265player: Web版H265播放器，基于JS解封装、WebAssembly(FFmpeg)解码，利用Canvas投影、AudioContext播放音频。](https://github.com/goldvideo/h265player)
* [FFmpeg编译过程 - 简书](https://www.jianshu.com/p/d08c0cff8a77)
* [BUG unknown file type · Issue #12344 · emscripten-core/emscripten · GitHub](https://github.com/emscripten-core/emscripten/issues/12344)

