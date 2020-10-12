# 为什么我们很可能不那么需要 else
> 自从人类首次开始编码以来，`if else` 就已经存在了。它是我们系统的核心，条件语句对于程序流控制至关重要。但是很多时候，我们真的需要 `if else` 吗？  

首先，来看一个最简单的 `if else` 代码，他可能是这样的：
``` javascript
const state = true
if (state) {
  console.log('true')
} else {
  console.log('false')
}
```

这当然是没有问题的，很简洁清晰，可事实是很多时候，代码逻辑并没有这么简单，甚至是可能随着时间而不断修改需求，最终代码可能是这样的：
``` javascript
const state = true
const state1 = true
const state2 = true
if (state) {
  console.log('true')
} else if (state1) {
  if (state2) {
    // ...
  } else {
    if (xxx) {
      // ...
    }
  }
  console.log('false')
} 
// ...
 else {
   // ...xxx
}
```

那么现在你还觉得他简洁清晰吗？显然不，每当进入一个循环你可能都要看一下这个循环的具体条件是什么，并且大量的 `if`、 `else`、 ` 花括号 ` 混杂在一起，甚至可能会看错，尤其是最后一个 `else`，你甚至要看完所有的 `if`，才会知道 `else` 究竟是代表了什么条件。
有没有更好的办法呢？当然有，那就是把这些操作给抽离出来，比如这样：
``` javascript
const state = true
const state1 = true
const state2 = true
if (state) {
  fun0()
} else if (state1) {
  fun1()
  console.log('false')
} 
// ...
 else {
  fun2()
}
```

之后单独在抽离 `function` 里添加条件，当然很多时候我们并不需要为一些并不会多次复用的代码抽离，那么还可以试试 return：
``` javascript
const state = true
const state1 = true
const state2 = true
if (state) {
  console.log('true')
  return
} 

if (state1) {
  if (state2) {
    // ...
    return
  } 

  if (xxx) {
    // ...
  }
  console.log('false')
} 
// ...xxx
```
这么做有相当多的优点，比如：
1. 减少了 `else` 之后，也同时减少了大量的 `{}`，大量的 `{}` 堆积在一起，很难辨认它属于哪个代码块
2. 代码更加的简洁，也更加容易理解
3. 减少了大量的缩进，和 `{}` 一样，大量的缩进也会让代码难以阅读（比如那个 python 用尺子量缩进的笑话一样）
4. 后续添加逻辑的时候只需要在对应的地方继续写一个 `if`， 然后 `return` 即可，不需要再继续一层套一层



另外，很多人都提到可以用 `switch` 来替代 `if`，但是其实我个人是不喜欢这么写的，`switch` 是属于短期看着美好，但是长期维护下来并不好用的东西，比如这样：
``` javascript
const n = 1
switch (n) {
  case 0:
    console.log('0');
    break;
  case 1:
    console.log('1');
  case 2:
    console.log('2');
  default:
    console.log(`default`);
}
```

发现了问题吗？ 对的，他没有 break，而一旦不 break 的后果是致命的，当 `switch` 匹配到了一个符合条件的内容之后，如果没有 break，他会一直进入后续所有的 `case`，不管这个 case 是否匹配上，可以试试这段代码，最终输出为：
``` javascript
"1"
"2"
"default"
```

不但是新手会犯这个错误，老手也能会在 ide 没有正确提示的情况下，在大量代码之后忘记 break，更麻烦的是，如果后续需要在 `case` 里继续添加其他代码，代码又包含逻辑判断以及 `return`，那么就更容易出现没有 `break` 的情况。所以 `switch` 除非是特别规律，特别简单的逻辑，否则我是不太爱用这个的。

当然还存在更多的情况是根本不需要用 `if else` 的，比如这样的代码：
``` javascript
const members = []
const male = []
const female = []

for (let i = 0; i<= members.length; i += 1) {
	if (member[i].sex === 'male') {
    male.push(member[i])
  } else {
    femalte.push(member[i])
  }
}
```

这个时候你可能会说，for 里我没办法 return，所以必须要写 else，看起来确实是这样，可事实上有必要这样吗？当然没有，你甚至 if 都不需要写，比如你可以试试这样：
``` javascript
const members = []
const male = members.filter(member => member.sex === 'male')
const female = members.filter(member => member.sex === 'female')
```
不要在意这样会走两遍 members 的循环的性能问题，大多数情况下这丁点的性能根本构不成差距。

事实上，并不是不让用 `if else`，这并不是一个一定要遵守的教条，我也并不是完全就不用 `else`，只是在很多情况下 `if else` 并不见得是一个最好的选择，在适当的时候及早 `return` 出去，适当用采取数组 api 进行操作，或许会让逻辑更加简单。当然我也知道，很多人并不喜欢 `return`，认为这样会带来其他的问题，的确是这样，但是我认为这也是一个取舍的问题，并不是完全就不要用，也不应该每个的地方都不停的 `return`，在适当的时候以别人能够轻松理解的逻辑在合适的地方 `return` 我认为是没有问题的。