
---
title: js 的词法作用域和 this
---


> **静态作用域**又叫做词法作用域，采用词法作用域的变量叫**词法变量**。词法变量有一个在编译时静态确定的作用域。词法变量的作用域可以是一个函数或一段代码，该变量在这段代码区域内可见（visibility）；在这段区域以外该变量不可见（或无法访问）。词法作用域里，取变量的值时，会检查函数定义时的文本环境，捕捉函数定义时对该变量的绑定。大多数现在程序设计语言都是采用静态作用域规则，如  [C/C++](https://zh.wikipedia.org/wiki/C/C%2B%2B) 、 [C#](https://zh.wikipedia.org/wiki/C%E2%99%AF) 、 [Python](https://zh.wikipedia.org/wiki/Python) 、 [Java](https://zh.wikipedia.org/wiki/Java) 、 [JavaScript](https://zh.wikipedia.org/wiki/JavaScript) ……相反，采用**动态作用域**的变量叫做**动态变量**。只要程序正在执行定义了动态变量的代码段，那么在这段时间内，该变量一直存在；代码段执行结束，该变量便消失。这意味着如果有个函数 f，里面调用了函数 g，那么在执行 g 的时候，f 里的所有局部变量都会被 g 访问到。而在静态作用域的情况下，g 不能访问 f 的变量。动态作用域里，取变量的值时，会由内向外逐层检查函数的调用链，并打印第一次遇到的那个绑定的值。显然，最外层的绑定即是全局状态下的那个值。采用动态作用域的语言有  [Pascal](https://zh.wikipedia.org/wiki/Pascal) 、 [Emacs Lisp](https://zh.wikipedia.org/wiki/Emacs_Lisp) 、 [Common Lisp](https://zh.wikipedia.org/wiki/Common_Lisp) （兼有静态作用域）、 [Perl](https://zh.wikipedia.org/wiki/Perl) （兼有静态作用域）。C/C++ 是静态作用域语言，但在宏中用到的名字，也是动态作用域。  


### 实践
思考这么一段代码：
``` javascript

function fun1() {
  var a = 2
  console.log(a)
}

function fun2() {
  var a = 3
  console.log(a)
  fun1()
}
 fun2()
```

 答案会是多少呢？
``` javascript
3
2
```

当然这个很好理解，`js` 是函数作用域，`fun1` 内有 `a`，当然会打印 fun1 内的 `a` 的值，并没有特殊之处，可是这个代码呢：
``` javascript
var a = 2
function fun1() {
  console.log(a)
}

function fun2() {
  var a = 3
  console.log(a)
  fun1()
}
 fun2()
```

答案和之前依旧一样，是不是这样就有点反直觉了？ `fun1` 内没有 `a` 的情况下不是应该读取 `fan2` 的 `a` 吗？为什么会读取 全局作用域的 a 呢？说好的作用域是一层一层向上的呢？

当然，作用域确实是向上查找，可是 js 是静态作用域（词法作用域），并不是动态作用域，所以他不会看函数的调用位置，而是定义位置，并且沿着定义位置向上查找。词法作用域和动态作用域的区别如下：

* 词法作用域是在 ** 代码解析（定义）** 的时候确定的，关注的是函数在 ** 何处定义 **，并从定义处向上查找作用域。
* 动态作用域是在 ** 代码运行 ** 的时候确定的，关注的是代码在 ** 何处调用 **，并从调用栈向上查找作用域。
- - - -
所以现在很好理解，为什么 `fun1` 内没有 `a` 他会先去读取全局的 `a`，而不是 `fun2` 的 `a` 了吧？不信可以看这个代码：
``` javascript
function fun1() {
  console.log(a) // a is not defined
}

function fun2() {
  var a = 3
  console.log(a)

  fun1()
}
fun2()
```

当然，js 有个特殊之处，就是 this，思考这段代码：
``` javascript
this.a =  2

function fun1() {
  console.log(this.a) // 1
}

function fun2() {
  this.a = 1
  console.log(this.a) // 1

  fun1()
}
fun2()
```

是不是疑惑了，说好的从定义的地方向上查找呢，为什么会打印出执行的作用域的值？
这里可以先说答案：因为 `this`：

``` javascript
this.a =  2
// this 指向 window

function fun1() {
  // 这里 this 还是指向 window
  console.log(this) // window
  console.log(this.a) // 1
}

function fun2() {
  // this 依旧指向 window，不信可以打印看看那
  console.log(this.a) // 2

  // 这里修改了外边的 this.a
  this.a = 1
  // 打印修改后的值
  console.log(this.a) // 1

  fun1()
}
fun2()
```
所以明白了吧？ 作用域依旧是在定义的地方向上查找，只不过是两个函数都指向了同一个 `this` 而已。
- - - -
> 这里插一嘴，虽然我认为 `js` 的 `this` 是一个设计的非常糟糕的东西（他完全不符合正常人的思维逻辑），我也非常非常久都不再使用 `this`，但是我认为这个东西还是必须得理解的，不然早晚会搞出大麻烦，你可以不用，但是你必须要懂。  

Ok, 接着上面所说，为什么两个函数指向了同一个 `this（window）`？这里就要深入的了解一下 `this` 的指向问题：`this` 究竟指向哪里，是都指向 window 么？显然不是，看一下代码：
``` javascript
this.n = 1

function fun2() {
  console.log(this.n) // 2
}
var a = {
  n: 2,
  fun1() {
    console.log(this) // {n: 2, fun1: function}
    console.log(this.n) // 2
    a.fun2()
  },
  fun2
}

a.fun1()
```

这里的 `fun1` 的 `this` 明显指向了 `a` 本身，并不是 `this`，同样 `fun2` 虽然定义在外部，但是也依然指向了 `a` ，是不是和之前想的不太一样？`fun2` 定义在外边，那么他的 `this` 应该是 `window` 才对，打印的应该是 1 才对啊，可能这个时候你就在想了，是不是 `this` 就是动态作用域呢？并不！ `This` 依旧是静态作用域，参考这个代码：

```
this.n = 1

function fun2() {
  console.log(this.n) // 1
}
var a = {
  n: 2,
  fun1() {
    fun2()
  },
  fun2
}

a.fun1()
```
 发现区别了吗？`this` 依旧是指向 `window`，这就说明 `this` 只是在定义的时候强行绑定了执行他的环境，所以我们通过 `a.fun2` 调用，`this` 就指向 `a`，通过直接调用 `fun2`（实际等于 `window.fun2）`，指向的则是 `window`。

当然也有例外，比如箭头函数：
```
this.n = 1

const fun2 = () =>  {
  console.log(this.n)
}
var a = {
  n: 2,
  fun1() {
    // console.log(this)  // {n: 2, fun1: function}
    // console.log(this.n) // 2
    a.fun2()
    // fun2()
  },
  fun2
}

a.fun1()

```
箭头函数中，不管你是 `a.fun2` 还是直接 `fun2`，指向的都是 `window`，因为箭头函数的 `this` 固定指向他的父作用域，而根据静态作用域的原则，他父作用域是定义时的作用域，也就是 `window`，所以不管怎么调用，他都是 `window`。通过以下这个例子更能看出来这一点，箭头函数的this固定指向他定义的作用域：
```
var n = 1
var a = () => {
    console.log(this.n)
}

var b={
    n: 2,
    fun2: {
        n: 3,
        fun1:a,
        fun() {
            a() // 1
            console.log(this) // {n: 3,     fun1:function, fun: function}
            console.log(this.n) // 3
            this.fun1() // 1

        }
    }
}
b.fun2.fun()
```

通过这个你就能发现，箭头函数的 this 并不指向调用他的对象，也不是指向调用他的对象的父作用域，而是指向他定义的位置的父作用域，不管你在哪里调用，都是同一个指向。
- - - -
### 总结
总结一下，对于 `this`，你只需要记住这几点：

* ** 正常情况下 this 指向调用他的上下文 **
* 箭头函数的 `this` 指向他的父作用域的 `this`（静态作用域、静态作用域、静态作用域）
* `new` 会创建一个新的对象，`this` 指向这个对象，详情可以自行了解 `new`
* `call`、`bind`、`apply` 会改变 this 的指向，详情自行了解

```
a.xx()
xx 内的 this 就是 a
a.b.xx()
xx 内的 this 就是 b
```
谁 `.`xxx，`.` 之前的上下文就是他的 this。
而在非严格模式的全局环境中（严格模式会报错），实际我们定义的变量都是挂载在 `window` 下，所以 `this` 指向的是 `window`。

