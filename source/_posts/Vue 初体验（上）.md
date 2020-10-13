
---
title: Vue 初体验（上）
---

# Vue 初体验（上）
### 背景
事实上我已经有几年没有使用 `Vue` 了，尤其是在 `react` 发布 `hooks` 之后，我已经全面转入了 `function component` 开发，好处是显而易见的，不用再去头疼 `this` `new` 之类的一系列问题了，也不用再去背下一个个不同又冗长的生命周期（我已经差不多忘了他们），我一直认为这样的开发才是最自然最贴近 `js` 的状态，只要掌握 `js` 即可，其他多余的并不关心。当然了，麻烦也自然不少，尤其是 `hooks` 设计上带来的一些新的问题（比如闭包），对于 `js` 老手而言自然不是问题，但是对于新手或者对于 `hooks` 不熟练的人，这就非常容易踩坑了。直到最近发现 vue3 似乎发布了第一个正式版，`Vue` 官网的文档也正式更新了 3.0，早就有听说 `Vue ` 在 3.0 也已经全面支持了 `function component`，以及相对于 `hooks` 的「改进版」，所以这次就来体验体验。

- - - -
### 实践
首先依旧是 `Vue cli` 创建一个项目，我使用的是 `vue ui`，我一直觉得 `vue` 在这方面干的不错，`vue ui` 使用起来很方便。创建一个项目之后，我发现似乎并不能原生支持 `tsx`，查询了一下，需要安装 ` @vue/babel-plugin-jsx` 这个 `babel` 插件，安装之后就可以直接引入 `tsx` 文件了，就像这样。
[code](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/9QOYoh.jpg)
#
这里需要注意，`Vue` 取消了暴露 `property` ，这也就意味着以前很多库和代码都无法正常使用，`vue3` 虽然大多数语法上都兼容了 `vue2`，虽然我很支持取消对于 `property` 的支持，但是类似于这种破坏性更新也意味着最起码短时间内 `vue3` 别期望能有太多库支持了。我看了一下之前我用的 `element ui`，果然不支持了…
接着看一下 `tsx`，我试了一下基本和 `react` 没有太大区别
```
export const App = () => {
  return (
    <div style={{ color: “red” }}>
      <Hello />
    </div>
  )
}
function Hello() {
  return <div>hello</div>
}
```

没错这就是我想要的效果，像写 `js` 一样写 `UI`，接着尝试一下更新的新 `api`，因为目前关于 `vue3 jsx` 写法文章并不多，以为 `relative` 应该等同于 `react` 的 `useState` ，所以按照写 `react hooks` 的方式尝试写了一下。

### 坑
```
export const App = () => {
  const count = reactive({ value: 1 })
  return (
    <div style={{ color: “red” }}>
      <button
        onClick={() => {
          count.value += 1
        }}>
        +1
      </button>
      {count.value}
      <Hello />
    </div>
  )
}
```
这个时候发现页面虽然能够渲染出正确的值，但是点击之后 `count` 永远都是 1，难道每次渲染 `relative` 都会重新生成值？ 这怎么和预想的不一样。随后查询资料发现原来要这么写
```
export const App = defineComponent(() => {
  const count = reactive({ value: 1 })
  return () => (
    <div style={{ color: “red” }}>
      <button
        onClick={() => {
          count.value += 1
        }}>
        +1
      </button>
      {count.value}
    </div>
  )
})
```
没错，需要用 `defineComponent` 作为高阶组件套一层，并且返回的需要是一个函数，而不是 `react` 那样可以直接返回一个 `dom`。老实说这就很奇怪了，为什么要套个 `defineComponent`，他做了什么？查询了一下源码，原来 `defineComponent` 并没有实际意义，只是为了 `Typescript` 的类型推导。那么如果目前我们不需要类型推导的话，大概这么写也是可以的
```
const count = reactive({ value: 1 })
export const App = () => {
  return (
    <div style={{ color: “red” }}>
      <button
        onClick={() => {
          count.value += 1
        }}>
        +1
      </button>
      {count.value}
    </div>
  )
}
```
尝试了一下，果然可以，并且也不会出现每次刷新的时候 `reactive` 都重新生成一次的问题，思考了一下，这里的 `jsx` 文件应该等同于 `vue` 模板里的 `setup` ，`setup` 只生成一次，后续只重新渲染 `setup ` 返回的函数（App），而不会重新渲染整个 setup(jsx 文件)，所以我们只需要返回一个渲染 `dom`，`relative` 应该定义在渲染的函数外部。
多个组件传参则和 `react` 一样，但是需要注意，这里并没有 `react` 的 `children`，依旧需要用第二个参数的 `slots` 来渲染子节点，这就让我感觉很奇怪了，既然用 `jsx`，就算为了兼容模板需要 `slots`，那也应该做一下 `children` 兼容才对，这并不是一个很困难的事情，只需要把 `children` 指向 `slots.default` 即可，不知道以后的版本会不会做这个处理。
```
export const App = () => {
  return (
    <div style={{ color: “red” }}>
      <button
        onClick={() => {
          count.value += 1
        }}>
        +1
      </button>
      <CountValue countValue={count.value}> 你好 </CountValue>
    </div>
  )
}

function CountValue(
  { countValue }: { countValue: number },
  { slots }: { slots: any },
) {
  return (
    <div>
      {slots.default()}
      {countValue}
    </div>
  )
}
```

[demo](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/DvYNDh.jpg)
同时我发现这样完全可以实现 `Typescript` 的类型推导
[ts 类型推导](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/C8FbKL.jpg)
#
这就让我很奇怪，为什么明明可以实现类型推倒还需要加个 `defineComponent` 呢，随后我去查了一下，原来 `defineComponent` 是这么写使用的
[code](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/sRF6LF.jpg)
[code](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/AI5zPH.jpg)
#
这个作者给出的写法据说是 `Vue` 作者给出的推荐写法，但是我并不太理解为什么需要这么写，明明直接使用 `jsx` 函数就已经很舒服了，我个人推测 `defineComponent` 更多还是为了 `vue` 模板写法或者这种对象的写法而搞出的东西，如果纯使用 `jsx` 的 `function component` 写法，应该是不需要这个的。
接着我突然想到，如果是这么写，其实子组件父组件完全可有其他状态传递方式，比如:
```
const count = reactive({ value: 1 })
export const App = () => {
  return (
    <div style={{ color: “red” }}>
      <Button />
      <CountValue countValue={count.value}> 你好 </CountValue>
    </div>
  )
}

function CountValue(
  { countValue }: { countValue: number },
  { slots }: { slots: any },
) {
  return (
    <div>
      {slots.default()}
      {countValue}
    </div>
  )
}

function Button() {
  return (
    <button
      onClick={() => {
        count.value += 1
      }}>
      +1
    </button>
  )
}
export const App = () => {
  return (
    <div style={{ color: “red” }}>
      <Button />
      <CountValue />
    </div>
  )
}

function CountValue() {
  return (
    <div>
      {count.value}
    </div>
  )
}

function Button() {
  return (
    <button
      onClick={() => {
        count.value += 1
      }}>
      +1
    </button>
  )
}
```

### 疑惑
并且因为 `Vue` 的响应式原理，父组件在使用了 `count` 并发生变化的时候，并不会连带着子组件 Button 也发生变化，`Button` 是不会重复 `Render` 的，但是每次点击却能拿到最新的值，每次点击的时候只有 `CountValue` 这种实际渲染了值的组件在发生 Render，这意味着实际上 `Vue` 哪怕是用 `jsx` 写法，也原生自带了 `shouldComponentUpdate` 的优化？
这是否意味着，其实 `relative` 自带一个全局状态？思考了一下，从 js 角度来讲，确实是这样，目前尚不得知这样的写法是否会有什么坑，是否被官方推荐，毕竟目前的资料实在太少，可能还需要后续实践这次就先写到这吧。

