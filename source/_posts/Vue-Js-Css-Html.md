---
categories: CS
cover: ../post_images/Vue-Js-Css-Html.jpg
date: 2020-06-11 23:06:56
description: 记录了我 2020.3-2020.6 在浙江大学上的《BS体系软件设计》这门课的课程设计所用到的前端知识点。
tags: [Course, Web]
title: 网页前端胡乱入门
updated: 2021-09-03
---

我用 Django + Vue 的架构完成《BS体系软件设计》的课程设计，这篇文章对 Vue 和前端技术做简单的总结。

## vue 的基本函数

+   `v-bind` 属性绑定：`<a v-bind:href="url"> ... </a>`
    +   也可以动态地绑定一个类 `v-bind:class="{‘textColor‘:isColor}`
    +   因为很常用，可以完全省略这个词。
+   `v-if` 条件语句：`v-if="seen"` 
    +   后面可以接 `v-else`，`v-else-if`
+   `v-on` 事件绑定：`<button v-on:click="myclick">click me</button>`
    +   可以绑定多个：`<v-on="{mouseenter:onenter,mouseleave:leave}">`
    +   可以用 `@` 来简写。
+   `v-model` 在一些表单控件元素上创建双向数据绑定
    +   `<input v-model="message">` 一开始显示 message 内容，message 也会绑定用户输入。
+   `v-for` 循环语句：`<li v-for="site in sites">`
    +   也可以迭代字典（第三个表示索引）`<li v-for="(value, key, index) in object">`
    +   也可以直接循环整数 `<li v-for="n in 10">`
+   过滤操作  
    +   调用：`{{ message | capitalize }}` 和 `<div v-bind:id="rawId | formatId"></div>`
    +   注意 vue 里定义的是 `filter`

## Vue 应用

+   `computed` 和 `method` 功能相同，前者会利用缓存，而后者每次渲染时会重新计算。
+   `watch` 监听相应数据的变化
    ~~~JavaScript
    vm.$watch('counter', function(nval, oval) {
        alert('计数器值的变化 :' + oval + ' 变为 ' + nval + '!');
     });
    ~~~
+   `v-model` 支持多个绑定，会以数组的形式呈现。
    
    ~~~html
    <p>多个复选框：</p>
      <input type="checkbox" id="runoob" value="Runoob" v-model="checkedNames">
      <label for="runoob">Runoob</label>
      <input type="checkbox" id="google" value="Google" v-model="checkedNames">
      <label for="google">Google</label>
      <input type="checkbox" id="taobao" value="Taobao" v-model="checkedNames">
      <label for="taobao">taobao</label>
    <!-- 选择的值为: [ "Runoob", "Taobao", "Google" ] -->
    ~~~

## Vue 组件

+   组件系统让我们可以用独立可复用的小组件来构建大型应用。
+   全局组件
    +   用 `Vue.component(tagName, options)` 定义
    +   用 `<tagName></tagName>` 调用
+   局部组件：在 Vue 创建时开一个 `components` 关键词。
    +   **prop** 是子组件用来接受父组件传递过来的数据的一个自定义属性。
        ~~~html
        <div id="app">
        	<child message="hello!"></child>
        </div>
        <script>
        Vue.component('child', {
          // 声明 props
          props: ['message'], // 可以在 vm 实例中像 “this.message” 这样使用
          template: '<span>{{ message }}</span>'
        })
        </script>
        ~~~
    +   在调用组件的时，可以用 `v-on` 把组件 **emit** 出来的返回值当做事件绑定到其他属性值 
        ~~~html
        // 使用
        <button-counter v-on:increment="incrementTotal"></button-counter>
        <button-counter v-on:increment="incrementTotal"></button-counter> 
        // 定义组件
        <script>
        Vue.component('button-counter', {
          template: '<button v-on:click="incrementHandler">{{ counter }}</button>',
          data: function () {
            return {
              counter: 0
            }
          },
          methods: {
            incrementHandler: function () {
              this.counter += 1
              this.$emit('increment')
            }
          },
        })
        </script>
        ~~~
    +   注意到上述代码的 data 里返回的是函数。如果返回的是对象，不同调用者会共享。