# Vue3 初体验（中），巨坑的事件绑定
就在刚刚，吃饭的时候突然发现 `vue3` 的一个很神奇的地方，具体看代码：
```
export const App = () => {
  return (
    <div style={{ color: “red” }}>
      <Button />
      <CountValue
        countValue={count.value}
        onClick={() => {
          *console*.log(“click”)
        }}>
        你好
      </CountValue>
    </div>
  )
}

function CountValue(
  { countValue, onClick }: { countValue: number; onClick: () => void },
  { slots }: { slots: any },
) {
  return (
    <div>
      <button
        onClick={() => {
          onClick1()
        }}>
        按钮
      </button>
      {slots.default()}
      {countValue}
    </div>
  )
}
```
那么你认为当我点击按钮的时候，会触发 onClick 事件几次？一次吧？
** 并不！**
** 他会触发两次！！！**
[demo](https://raw.githubusercontent.com/jinzhuming/oss/master/uPic/wQHWU6.jpg)

你以为到这就结束了？
** 并不！！！**
不但点击按钮会触发，点击子组件（`CountValue 组件 `）任何一个地方他都会触发！！！
我一度怀疑是不是我的代码出了 `bug`，反复检查发现，只要是绑定的和原生事件同名的事件，他都会在 ** 根节点上自动绑定！！！**
这简直是一个神坑操作，我查阅了一下，目前网上提到的人并不多，但是普遍认为这是一个很坑的操作。我也是这个时候才明白了 `defineComponent` 根本不是给 `vue` 模板用的，是 `vue` 自己造出来为了让你声明事件用的，只有你在 `defineComponent` 里明确声明的事件他才不会绑定，否则他都会强制绑定到根节点去。参考这个代码，是没有问题的
```
const CountValue = defineComponent({
  props: {
    onClick: {
      type: Function,
    },
    countValue: Number,
  },
  setup(props) {
    return () => (
      <div>
        <button
          onClick={() => {
            if (props.onClick) {
              props.onClick()
            }
          }}>
          按钮
        </button>
        {props.countValue}
      </div>
    )
  },
})
```

** 必须要强制声明 ****props**，他才不会强制绑定到根节点。
我真的无法理解这是个什么设计，既然有了 `Typescript`，有了 props 这种 js 原生支持的传递方式，你为什么非要抱着自己搞出来的这套不放呢？
```
{onClick, countValue}: {onClick: () => void; countValue: number}
```
`Ts` 这么简洁的 `props` 类型难道不比那自己搞出来的更好用吗？
换句话说，就算想保留这套，为什么又要强制绑定到组件根节点去呢？如果我需要做这个操作我自己不会来吗，如果我不需要这个操作又被强制绑定不会出问题吗？
同时这意味着哪怕你写一个最简单的小函数组件也要套一层这个恶心人的函数，传递进去一个对象，否则你就要千万千万注意不要起和原生事件同名的事件名，还要注意你取的名字未来浏览器也不会占用，否则出问题是早晚的事情。
更令人担忧的是，如果真的有人传入进来一个我并没有做任何事件绑定（也不打算绑定）的事件，这个事件又被强制绑定到了根节点，是否会出现在我意料之外的情况？这意味着代码根本不由我控制，除非我预先预料到使用者可能绑定的任何事件，都提前做好处理，或者使用者完全按照我的文档使用，不出现任何意外。而这两者都显然是不可能的。
而且问题还不在这，问题在于这么搞极大限制了高阶函数，每个高阶函数必须要完整的声明所有的 props，否则就有可能会出现 props 的事件被绑定到根节点的问题。但事实上在高阶函数里，我关注你其他的点吗？并不啊，我为什么非要再重复声明一遍呢？ 如果是多个不同的子组件我想共用一个高阶函数做一个操作呢？
就目前而言除了放弃 `on` 开头 改用 `bindClick` 这种之外，我没有发现什么好的规避这个设定的方法。
补充：刚刚仔细翻看了文档，发现 `vue` 官方给了一个 `inheritAttrts` 可以控制是否绑定，看了下这个 `api`，是从 vue2.4 加入的，当时我已经不用 vue 了难怪不知道，但是这个正如我之前说的，必须要套一层 `defineComponent` 才能声明，而且还要每次强制手动声明，同时对于高阶组件依旧没什么用。另外这个属性在 `vue2` 和 `vue3` 甚至会出现表现不一致的情况（2 这个无论怎么设置不会影响 `class` 和 `style`，而在 3 则会），这简直无力吐槽… 真的是和 `vue` 对于 `data` 里数组的设计一样迷。不知道这个属性未来是否会做修改，感觉大概率不会。