
---
title: 云服务器搭建 AdGuard Home
---

云服务器搭建 AdGuard Home


> [AdGuardHome](https://github.com/AdguardTeam/AdGuardHome) 是一款全网广告拦截与反跟踪软件，AdGuard Home 项目是著名广告拦截器提供商 AdGuard 开源的一个 DNS Server 版本。AdGuard Home 可以将广告与追踪相关的域名屏蔽，同时你不再需要安装任何客户端软件。AdGuard Home 的工作原理是在 DNS 的域名解析过程里拦截网页上的广告。  
> 简单来说 AdGuard Home 是一个支持广告过滤和家长控制的开源公共 DNS 服务，如同 Google 的公共 DNS 服务 8.8.8.8。AdGuard Home 同时也支持 DNS over TLS 和 DNS over HTTPS。  

### 主要功能
* 拦截随处可见的广告
* 注重隐私保护
* 家庭保护模式
* 自定义过滤规则

### 安装准备
* 一台云服务器

### 安装过程
首先进入云服务器，然后参考 [官方安装文档](https://github.com/AdguardTeam/AdGuardHome/wiki/Getting-Started#installation)，下载对应的安装版本。
查看版本可以使用命令：`uname -a`，我的返回的是：`Linux VM-0-14-debian 4.19.0-6-amd64 #1 SMP Debian 4.19.67-2+deb10u2 (2019-11-11) x86_64 GNU/Linux`
所以下载 64 位版本
```
// 下载
wget https://static.adguard.com/adguardhome/release/AdGuardHome_linux_amd64.tar.gz

# 解压
tar -zxvf AdGuardHome_linux_amd64.tar.gz

# 进入 AdGuardHome 目录
cd AdGuardHome

# 启动 AdGuard Home
./AdGuardHome -s install

// 访问 ip:3000 来配置 adguard home
```

![配置](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/9GGgct.png)

后续按照设置一路走即可，记住自己设置的密码和端口。
![配置页面](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/pPTZJv.png)

这样就算安装配置完毕。

### 使用
点击设置，dns 设置
设置一下上游服务器，可以根据自己需要设置
```
1.1.1.1
180.76.76.76
119.29.29.29
223.5.5.5
114.114.114.114
8.8.8.8
```

点击应用，保存配置。
其他 `DNS 服务设定 ` 可以自行根据需要设置，我这里把 ** 速度限制 ** 设置为 0，同时开启 `EDNS`，同样需要点保存。其他的配置自行研究即可。
点过滤器设置，可以自行添加自己需要的过滤器，推荐两个
```
// 乘风 广告过滤规则
https://raw.githubusercontent.com/xinggsf/Adblock-Plus-Rule/master/ABP-FX.txt

// EasyList China+EasyList
https://easylist-downloads.adblockplus.org/easylistchina+easylist.txt
// 一个集合规则，easylist 和其他服务的集合
https://gitee.com/halflife/list/raw/master/ad.txt
```

另外在 ** 设置 - 加密设置 ** 内可以配置 `https` 加密，按需要自行解决。
另外可以添加开机启动。
```
systemctl enable AdGuardHome
```

最后贴几个 adguard home 管理命令
```
# 启动 AdGuardHome 服务
./AdGuardHome -s start

# 停止 AdGuardHome 服务
./AdGuardHome -s stop

# 重启 AdGuardHome 服务
./AdGuardHome -s restart

# 查看 AdGuardHome 服务状态
./AdGuardHome -s status

# 卸载 AdGuardHome 服务
./AdGuardHome -s uninstall
```
同时在解压安装的这个文件夹内还有一个 yaml 配置文件，也可以通过配置文件修改内容

需要注意，最好不要通过 53 端口访问，不然可能存在被运营商警告的风险（命令禁止私人 dns），但是通过其他端口私人使用一般是没有事情的
