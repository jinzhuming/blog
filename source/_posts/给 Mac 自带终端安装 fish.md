
---
title: 给 Mac 自带终端安装 fish
---

# 给 Mac 自带终端安装 fish
最近感觉 `iterm2` 有些不流畅，尝试了一下自带终端，感觉异常的流畅，所以干脆打算切换到自带终端尝试一下，自带终端默认的 `bash` 太难用，所以装个 `fish` 先，不使用 `zsh` 是因为懒得折腾。

### 安装 fish
```
brew install fish
```

### 将 shell 替换为 fish-shell
![设置](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/VnBBTr.png)
之后进入偏好设置 -> 用户与群组，先解锁左下角的安全锁定，然后右键你当前用户 -> 高级选项，修改一下默认 `shell` 即可 `/usr/local/bin/fish`
![用户](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/LPeGoR.png)
当然你也可以搜索一下其他命令，使终端默认打开时进入 `fish`。
最后重启一下终端，再打开即是 `fish` 了。
![fish](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/OLa6jh.png)

### 个性化配置 fish
在 `fish` 下输入命令，即可进入 `fish` 配置页面
```
fish_config
```

![fish_config](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/khRqOR.png)
可以根据需要自行配置，另外也可以在终端的偏好设置内设置主题。

### 注意事项
默认把终端设置为 `fish` 可能会在使用一些脚本的时候出现麻烦，比如你可能无法使用一些 `bash` 下的命令，所以如果出现执行脚本出现错误需要观察是否为某些命令缺失（我在装 `wasm` 编译 `ffmpeg` 的时候就出现过），需要退出 `fish` 再执行，出现问题的时候仔细看一下报错即可。另外也可以一劳永逸的尽量不要在本机装乱七八糟环境，直接放到 `docker` 内操作，保持本机系统的纯净。

### 小 tips
* 如果碰到 `ssh` 链接远程服务器，过一段时间不操作就断开，可以使用
```
// 打开配置文件
vim /etc/ssh/sshd_config 

// 添加这一行，每 60s 发送一个空包，保持活跃防止断开
ClientAliveInterval 60
```
* 切换终端麻烦，`iterm2` 提供了一个快捷键快捷显示和隐藏终端，在 mac 自带终端不支持这个功能，可以下载一个 `Thor` 来解决
![Thor](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/ASyRjR.png)

![Thor](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/2RJB2f.png)
![终端](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/CbcO41.png)
终端本身不是可卸载程序，所以在应用内没有，需要手动搜索一下添加。同理，这个软件还可以添加其他的应用并设置快捷键。
