# clash 实现订阅节点与规则的分离

### 背景
> 最近发现我的 mac 上 spark 客户端收不到 gmail 了，多方排查发现最终原因是因为我一直使用的 ss 服务商把 iplc 的邮件服务给屏蔽了，只能使用中继来接收邮件。但是服务商提供的订阅里没有单独的 mail 规则，意味着要么放弃 iplc 全盘使用中继线路，要么自己改写规则。  

### 解决方案
但是查看了 clash 规则之后发现，classh 并没有实现类似 quan、surge 一样的节点订阅与规则分离，这意味着就算我修改了当前规则，每次更新订阅后又回恢复原状，还需要再手动修改一次，这显然是不能接受的，所以写了个 node 服务来实现这个功能。
先来理清一下思路，实现规则与订阅分离需要的步骤


* 有一份空的规则文件
* 有一份节点列表
* 把节点列表的节点填充到规则文件里
* 替换掉当前的 clash 的 config 文件

规则文件我写了一个 [空规则]( https://github.com/jinzhuming/clash-trs-rules/blob/master/rule.json )，有需要的可以直接使用或者按照自己的实际需求更改。

节点列表首先需要你的服务商有提供 clash 的订阅链接（如果是其他订阅链接，需要自己改写代码来转换，或者找现成的订阅转换服务转换为 clash）。

合并的代码如下
** 这里需要注意，clash 最近更新了新版订阅文件规则，所以代码也有所更新，我的 github 并没有实时更新（每次更新都要去掉敏感信息）**

[https://github.com/jinzhuming/clash-trs-rules/blob/master/rule.json](https://github.com/jinzhuming/clash-trs-rules/blob/master/rule.json)
```javascript
// 引入网络请求模块
const request = require(“request”);
// yml 转为 json 方便操作
const yaml = require(“js-yaml”);
// cron 定时执行
const schedule = require(“node-schedule”);
// json 转为 yml
const YAML = require(“json-to-pretty-yaml”);
// rxjs 相关
const { forkJoin, of, Observable } = require(“rxjs”);
const fs = require(“fs”);
const { map } = require(“rxjs/operators”);
// 订阅地址
const url = “www.xxoo.com/list”;
const getRules = () => {
  // 获取节点信息
  forkJoin(
    new Observable(function (observer) {
      request(url, function (error, response, body) {
        if (error) {
          observer.error();
        } else {
          observer.next(body);
        }
        observer.complete();
      });
   // 转换为 json
    }).pipe(map((proxiesConfigYml) => yaml.load(proxiesConfigYml))),
   // 获取空的规则文件，如果是网络规则，自行 写 request，forkjoin 会合并两个数据
    of(require(“./rule.json”)),
  )
    .pipe(
// 这里可以做一些规则转换操作，比如修改名称，添加 icon，或者过滤节点
      map(([proxiesConfigJson, rules]) => ({
        …rules,
        proxies: proxiesConfigJson.proxies
          .filter((item) => !item.name.includes(“专线”) || !item.name.includes(“01”) || !item.name.includes(“日本”))
      })),
// 这里把过滤好的节点给写入到 rules 的 proxy-groups 里，同时对节点进行一个分组归类效果，把指定地区的节点添加到各自的分类，还可以把节点添加到自己定义的 select 里，按需操作即可
      map((rules) => ({
        …rules,
        [“proxy-groups”]: rules[“proxy-groups”].map((item) => {
          if (item.name === “Proxies”) {
            return {
              …item,
              proxies: [“HK”, “SG”, “JP”, “US”, “TW”].concat(rules.proxies.map((proxy) => proxy.name)),
            };
          }

          if (item.name === “HK”) {
            return {
              …item,
              proxies: 
                rules.proxies.filter((proxy) => proxy.name.includes(“香港”)).map((proxy) => proxy.name),
             
            };
          }
          if (item.name === “SG”) {
            return {
              …item,
              proxies: 
                rules.proxies.filter((proxy) => proxy.name.includes(“新加坡”)).map((proxy) => proxy.name),
             
            };
          }
          if (item.name === “JP”) {
            return {
              …item,
              proxies: 
                rules.proxies.filter((proxy) => proxy.name.includes(“日本”)).map((proxy) => proxy.name),
              
            };
          }

          if (item.name === “US”) {
            return {
              …item,
              proxies: 
                rules.proxies.filter((proxy) => proxy.name.includes(“美国”)).map((proxy) => proxy.name),
              
            };
          }
          if (item.name === “TW”) {
            return {
              …item,
              proxies: 
                rules.proxies.filter((proxy) => proxy.name.includes(“台湾”)).map((proxy) => proxy.name),
              
            };
          }
          if (item.name === “Mail”) {
            return {
              …item,
              proxies: rules.proxies.filter((proxy) => proxy.name.includes(“中继”)).map((proxy) => proxy.name),
            };
          }

          return item;
        }),
      })),
    )
    .subscribe((rules) => {
// 把我们转换好的节点重新生成为 yml，然后写入到 clash 的 config 目录里
     const newRulesFile = YAML.stringify(rules);
      fs.readFile(“/Users / 你的用户名 /.config/clash/rules.yaml”, “utf-8”, (err, data) => {
// 判断一下如果没有发生变化就不替换了
        if (data === newRulesFile) {
          console.log(“相同不触发替换”);
        } else {
          fs.writeFile(“/Users/jinzhuming/.config/clash/rules.yaml”, newRulesFile, () => {});
        }
      });
    });
};
```

这样就完成了基本的节点规则分离效果，接下来需要把服务设置为定时任务以及开机启动，这样每次开机都会自动启动服务，在指定的时间更新节点信息

### 定时启动

``` javascript
// 根据 cron 设定执行时间，每天 13 点 30 分执行一次更新
const scheduleCronstyle = () => {
  schedule.scheduleJob(“30 13 1 * * *”, () => {
    getRules();
  });
};
// 启动服务的时候立即执行一次
getRules();
scheduleCronstyle();
```


### 开机启动 
1. 写一个 .startup.sh，然后在 偏好设置 - 用户与群组 - 启动项里添加进这个文件，每次开机就会自动执行命令
2. pm2 维持服务
```
cd ~/ 服务所在文件夹 && pm2 start index.js —name ssRules
```


这样就完成了最基本的节点订阅和规则订阅分离效果，自行改写的订阅链接也不会再因为更新而被覆盖掉。目前已经稳定跑了几个月了，需要什么规则自己加，再也不依赖服务商了
