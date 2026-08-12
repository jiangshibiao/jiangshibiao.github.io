---
categories: Lang
cover: ../post_images/Go-Essentials.jpg
date: 2026-07-16 21:06:33
description: 记录了我对 Go 语言的系统性学习。
tags: [Digest, Go]
title: Go 基础语法
updated: 2026-07-26
---

Rust 和 Go 都是当下极为流行的后端编程语言，我将记录从前者出发学习后者的心得和感悟。

> Rust 把复杂度交给编译器和开发者，换取极致的安全与性能；Go 把复杂度砍掉，换取极致的简单与工程效率。

Go 的优势非常明显：

- **语法极简，学习曲线平缓**。整门语言只有 25 个关键字，没有类、继承和异常，一个下午就能开始写业务代码，团队协作时几乎不存在“看不懂同事代码”的问题。
- **原生并发模型**。goroutine + channel 内置于语言，`go func()` 一行就拉起一个初始栈仅 2KB 的轻量协程，不需要在 Rust 的 `async/await`、`Pin`、`Send + Sync` 约束里挣扎。
- **极快的编译速度**。Go 从设计之初就为编译速度优化（严格的依赖管理、禁止循环导入、导出信息扁平化），百万行级别的项目也能在几十秒内完成构建，这和 Rust 正好是两个极端。
- **静态链接的单二进制部署**。默认产出不依赖系统动态库的可执行文件，交叉编译改两个环境变量即可，扔到任何同架构的机器或 scratch 容器里就能跑——这也是 Go 在云原生领域统治级地位的重要原因。
- **官方统一工具链**。gofmt 统一了全世界 Go 代码的格式（没有配置项，没有争论），`go vet` 做静态检查，`go test` 内置测试与基准，`pprof` 做性能剖析，全部开箱即用。
- **强大的标准库**。HTTP 服务器、JSON、加解密、压缩开箱即用，写网络服务经常可以做到零第三方依赖。
- **省心的 GC**。并发三色标记清除垃圾回收器把 STW 控制在亚毫秒级，绝大多数业务场景无需思考内存管理。

Go 的缺点同样鲜明，体感最强烈的是错误处理：满屏的 `if err != nil { return err }` 样板代码，写多了确实会怀念 Rust 的 `?` 运算符。其次是类型系统偏弱——泛型直到 Go 1.18（2022 年）才姗姗来迟，且限制不少；没有 sum type，没有 `Option`，`nil` 同时承担了空指针、空 slice、空 map、空 interface 等多重语义，坑不少。很多在 Rust 里编译期就能拦下的错误，在 Go 里要靠约定、code review 和 `-race` 检测兜底。

## 环境安装和资料推荐

Go 的工具链是一体化的，一个 `go` 命令覆盖构建、测试、依赖管理、文档、剖析等所有环节。

- `GOROOT`：Go 的安装目录，存放标准库和工具链本体，一般不需要手动设置。
- `GOPATH`：历史上是所有 Go 代码的强制工作区（代码必须放在 `$GOPATH/src` 下），Go 1.11 引入 module 模式后这个约束被废除。现在 `GOPATH`（默认 `~/go`）只剩两个用途：`$GOPATH/pkg/mod` 存放下载的依赖缓存，`$GOPATH/bin` 存放 `go install` 安装的二进制。

module 模式在 Go 1.11 引入、Go 1.16 起默认开启。项目可以放在任意目录，由 `go.mod` 声明模块身份。

开发环境推荐 VSCode + Go 插件（背后是官方语言服务器 gopls）或 GoLand。格式化用 `gofmt`（扩展工具 `goimports` 可以顺带整理 import 分组），lint 用聚合器 `golangci-lint`，调试器用 `dlv`（Delve）。

Go 的教程和资料：

| 网址                                              | 描述                                                    |
| ------------------------------------------------- | ------------------------------------------------------- |
| [A Tour of Go](https://go.dev/tour/)              | 官方交互式入门教程，两三个小时可过完                    |
| [Effective Go](https://go.dev/doc/effective_go)   | 官方风格指南，写出地道 Go 代码的必读文档                |
| [Go 语言圣经（GOPL）](https://gopl-zh.github.io/) | 《The Go Programming Language》中文版，体系最完整的教材 |
| [Go by Example](https://gobyexample.com/)         | 带大量代码示例的教程，风格类似 Rust by Example          |
| [Go 101](https://go101.org/)                      | 深挖语言细节和内存模型的进阶资料                        |
| [pkg.go.dev](https://pkg.go.dev/)                 | 官方包文档平台，地位类似 crates.io + docs.rs            |
| [go.dev/blog](https://go.dev/blog/)               | 官方博客，slice/map/GC 等底层机制的第一手资料           |
| [Dave Cheney's Blog](https://dave.cheney.net/)    | 高质量的 Go 性能与工程实践文章                          |

Go 的 runtime 内置了剖析支持，import 一个 `net/http/pprof` 包就能通过 HTTP 端点拿到线上服务的 CPU、堆、goroutine、锁竞争等 profile，配合 `go tool pprof` 的火焰图定位问题。

## 包管理

一个 Go 项目（module）里通常含有以下几项：

| 路径                | 功能                                                         |
| ------------------- | ------------------------------------------------------------ |
| `go.mod`            | 清单文件。声明模块路径、Go 版本、直接依赖及其版本            |
| `go.sum`            | 校验文件。记录所有依赖（含间接依赖）内容的哈希，保证可复现构建，防止依赖被篡改 |
| `main.go` / `cmd/*` | 程序入口。`package main` + `func main()` 构成可执行程序，多个二进制习惯上放在 `cmd/<name>/` 下 |
| `internal/*`        | 内部包目录。编译器强制：只有本模块（internal 的父目录子树）能导入 |
| `vendor/*`          | 可选的依赖副本目录，由 `go mod vendor` 生成，存在时构建默认使用它。 |
| `*_test.go`         | 测试文件。与被测代码放在同一目录，`go build` 时忽略，`go test` 时编译。 |

模块（module）是版本管理和发布的单位，对应一个 `go.mod`；包（package）是编译和导入的单位，对应一个目录——同一目录下所有文件必须声明相同的 `package` 名。Rust 的 mod 树是在代码里声明的逻辑结构，Go 的包结构就是物理目录结构。

- 可见性规则：Go 没有 `pub` 关键字，可见性完全由标识符首字母大小写决定。首字母大写（大驼峰）的函数、类型、字段、常量对包外可见（导出），小写（小驼峰）则仅包内可见。
- `internal` 目录：放在 `internal/` 下的包只能被其父目录子树内的代码导入，编译器强制执行。
- 依赖版本选择用 MVS（Minimal Version Selection）算法：取所有依赖声明中的最大下界，而不是像 Cargo 那样求解最新兼容版本。所以结果是构建天然可复现，不需要真正意义上的锁文件。
- 为了践行语义化导入版本（Semantic Import Versioning），当一个库发布 v2.0.0 或更高的主版本时，它的模块路径（module path）必须变成 `…/v2` 的形式或更高版本的形式，即新包可以和旧包兼容存在。

`go.mod` 长这样：

```go
module github.com/user/project

go 1.22

require (
    github.com/gin-gonic/gin v1.10.0
    golang.org/x/sync v0.7.0
)

replace github.com/user/lib => ../lib
```

- `replace` 指令把某个依赖指向本地路径或 fork，仅对主模块生效，常用于本地联调。
- Go 1.18 引入了工作区模式（`go.work`）：多个模块协同开发时，用 `go work init ./mod-a ./mod-b` 生成 go.work，比在各个 go.mod 里手写 replace 干净得多，且 go.work 不需要提交到仓库。
- `go mod vendor` 把所有依赖拷贝进 `vendor/` 目录，构建时加 `-mod=vendor`（存在 vendor 目录时默认启用）。适合需要离线构建或审计依赖的场景。

导入路径就是模块路径 + 包目录，支持别名与空白导入：

```go
import (
    "fmt"                            // 标准库
    "github.com/gin-gonic/gin"       // 第三方包，用最后一段 gin 作为包名
    myjson "encoding/json"           // 别名导入
    _ "net/http/pprof"               // 空白导入，只执行包的 init()，注册副作用
)
```

`init()` 函数用于包初始化。初始化顺序：先初始化被依赖的包，再初始化包级变量，最后执行 `init()`；一个包里允许定义多个 `init()`。程序所有的 `init()` 跑完后才进入 `main()`。最典型的用途是驱动注册，`database/sql` 的数据库驱动就是靠匿名导入触发 `init()` 把自己注册进框架的。

Go 的编译器很严格，未使用的导入和未使用的局部变量会报编译错误，也不允许循环导入。

## 基本语法

Go 是静态类型语言，支持类型推导。变量声明有几种形式：

```go
var a int           // 声明并赋零值 0
var b = 10          // 类型推导
c := 20             // 短变量声明，只能在函数内使用
var x, y = 1, "hi"  // 平行声明，类型可不同
```

`:=` 的两条限制：只能用在函数内；同一作用域内不能用它纯重复声明同一个变量，除非左侧至少有一个新变量。注意它是"声明"而非"赋值"：在内层作用域对同名变量使用 `:=` 会创建一个新变量遮蔽（shadow）外层变量。

```go
var err error
if cond {
    result, err := doSomething() // 这里的 err 是新变量！外层 err 永远是 nil
    _ = result
    _ = err
}
if err != nil { // 永远不会触发
    return err
}
```

`go vet` 的 shadow 检查器可以辅助发现上述遮蔽 `err` 的问题：。补充一个规则：`:=` 左侧只要有至少一个新变量就合法，其余同名变量在**同一作用域**下是赋值、跨作用域则是新声明——坑就坑在这个差异上。

常量用 `const` 声明，是编译期概念，没有内存地址。Go 的无类型常量（untyped constant）有任意精度，直到被使用时才收敛到具体类型，所以 `const big = 1 << 62` 可以直接参与运算而不用担心中间溢出。

```go
const Pi = 3.14159      // 无类型常量：既能当 float64 也能参与整数运算
const Size int64 = 1024 // 有类型常量

const huge = 1 << 100 // 任意精度，编译期成立
const four = huge >> 98 // 使用时收敛为 int，值为 4
```

`iota` 是 const 块里的行号计数器（从 0 开始，逐行加一），是 Go 模拟枚举的惯用手段。其本质就是整数：

```go
type Weekday int

const (
    Sunday Weekday = iota // 0
    Monday                // 1，省略表达式则复用上一行
    Tuesday               // 2
)

const (
    _  = iota             // 跳过 0
    KB = 1 << (10 * iota) // 1 << 10
    MB                    // 1 << 20
    GB                    // 1 << 30
)
```

控制流方面，Go 只有一种循环 `for`，`if`/`switch` 都不需要给条件加括号。

+ 注意 range 的第二个返回值是拷贝，即用 `for _, v := range s { v.X = 1 }` 改的是副本，想原地修改必须用下标 `s[i].X = 1`。这里提一个重要的版本演进：Go 1.22 修复了 for 循环变量捕获问题。此前 `for i, v := range s` 的 `i`、`v` 在整个循环中是同一个变量，闭包里捕获它们会拿到最后一轮的值，堪称 Go 历史上被踩得最多的坑；1.22 起每轮迭代拥有独立的循环变量，老代码里满地的 `i := i` 拷贝惯用法就此退休。
+ `switch` 的 case 支持多值列表，默认不穿透，需要穿透时显式写 `fallthrough`；支持无表达式的 switch。
+ `goto` 存在且偶尔有用（跳出多层循环的另一个选择是带标签的 `break LABEL`）。

```go
if v := compute(); v > 0 { // if 支持前置语句，v 的作用域仅限 if/else 块
    fmt.Println(v)
}

for i := 0; i < 10; i++ {} // 经典三段式
for cond {}                // 相当于 while
for i, v := range slice { fmt.Println(i, v) } // range 遍历（循环变量不用会报编译错误）
for range 5 {}             // Go 1.22 起支持 range over int
for {}                     // 死循环

switch x := f(); x {
case 1, 2:                 // 多值匹配，不需要 break
    fmt.Println("small")
case 3:
    fallthrough            // 显式穿透到下一个 case
default:
    fmt.Println("big")
}

switch {                   // 无表达式的 switch，相当于 if-else 链
case x < 0:
case x == 0:
}
```

函数支持多返回值，这是 Go 错误处理风格的基石；还支持命名返回值（在 defer 里可以修改它，后文会用到）：

```go
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

func split(sum int) (x, y int) { // 命名返回值，自动声明并赋零值
    x = sum * 4 / 9
    y = sum - x
    return // 裸 return，返回当前 x, y
}
```

函数调用里，**defer** 可把推迟到当前函数返回前执行：

- 无论正常 return 还是 panic 展开都会执行，多个 defer 按 **LIFO（后注册先执行）** 的顺序执行。
- defer 语句的**参数在注册时立即求值**，函数体在返回时才执行。例如 `defer fmt.Println(i)` 打印的是注册时刻的 `i`，想延迟求值就得包一层闭包。
- defer + 命名返回值可以在 return 之后、真正退出之前修改返回值。

defer 的开销经历过一轮显著演进：早期版本每个 defer 都在堆上分配 `_defer` 记录并挂链表，开销几十纳秒；Go 1.13 改为多数场景栈上分配；Go 1.14 引入 open-coded defer，把不在循环里的 defer 直接内联展开成函数尾部的普通调用，开销降到接近直接调用。现在除了热循环内部，基本不用为 defer 的性能操心。

## 基本数据类型

Go 的基本类型一览：

| 分类   | 类型                                                         | 说明                                                         |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 整型   | `int 8/16/32/64`, `uint 8/16/32/64`, `int`, `uint`, `uintptr` | `int` 的宽度与平台相关（64 位平台上是 64 位），字面量默认推导为 `int`；`uintptr` 一般配合 unsafe 使用 |
| 浮点   | `float32`, `float64`                                         | 字面量默认 `float64`，没有 `float`                           |
| 复数   | `complex64`, `complex128`                                    | 内置复数支持，`complex(1, 2)`、`real()`、`imag()`            |
| 布尔   | `bool`                                                       | 不能与整数互转，即 `if 1 {}` 是编译错误                      |
| 字符串 | `string`                                                     | 不可变字节序列，通常是 UTF-8 编码                            |
| 别名   | `byte` = `uint8`，`rune` = `int32`                           | `byte` 表示原始字节，`rune` 表示一个 Unicode 码点            |

零值机制是 Go 的核心设计，变量声明后自动初始化为零值——数值为 `0`，布尔为 `false`，字符串为 `""`，指针、slice、map、channel、函数、interface 为 `nil`。不存在"未初始化变量"，很多类型（如 `sync.Mutex`、`bytes.Buffer`）刻意设计成"零值即可用"。

类型转换必须显式写成 `T(x)`。Go 没有任何数值隐式转换，`int32` 和 `int64` 相加都得先转：

```go
var a int32 = 1
var b int64 = 2
c := int64(a) + b        // 必须显式转换
f := float64(c) / 3.0
r := rune(65)            // 'A'
```

任何编译模式下，整型溢出时都不 panic，按补码继续工作（不同于 Rust 在 debug 模式下会 panic）。

类型推断之外还有两种定义类型的方式，区别微妙：

```go
type Celsius float64      // 类型定义：全新的类型，可挂方法，与 float64 互转需显式
type Fahrenheit = float64 // 类型别名：同一个类型，与 float64 随便混用
// 类型别名是 Go 1.9 引入的，`byte`/`rune`/`any` 都是官方别名。
```

数组 `[N]T` 是值类型，长度是类型的一部分（`[3]int` 和 `[4]int` 是不同类型），赋值和传参会整个拷贝。元素可比较时数组也可以用 `==` 比较。日常代码里裸数组出场率很低，几乎总是通过 slice 使用：

```go
a := [3]int{1, 2, 3}
b := a          // 整个数组拷贝，修改 b 不影响 a
b[0] = 100
fmt.Println(a[0], b[0]) // 1 100
```

Go 指针只有去地址和解引用两种基本运算符，不支持算术运算（不能 `p+1` 跳到下一个元素）。

```go
x := 42
p := &x  // 取地址，类型 *int
*p = 43  // 解引用并修改
p := new(int)        // 返回 *int，指向零值；适用于任何类型，实际很少用
s := make([]int, 3, 5) // 返回初始化后的值而非指针，len=3, cap=5
```

Go 没有所有权和借用检查，多个指针同时读写同一块内存完全合法，回收交给 GC 兜底。

## slice 和 string

slice 是 Go 使用频率最高的容器。它在运行时是一个三元组结构：

- slice 本身是个 24 字节（64 位平台）的小结构体，赋值和传参时拷贝的是这三个字，底层数组是共享的——所以函数内 `s[0] = x` 对调用方可见，但 `s = append(s, x)` 若触发扩容则对调用方不可见。
- 扩容策略（Go 1.18 起的实现）：所需容量超过当前两倍则直接用所需容量；否则旧容量小于 256 时翻倍，大于 256 时按约 1.25 倍平滑增长（公式 `newcap += (newcap + 3*256) / 4`，容量越大增长系数越接近 1.25）。最终还会按内存分配器的 size class 向上取整，所以实测容量可能比公式略大。
- `len(s)` 和 `cap(s)` 都是 $O(1)$ 的字段读取。切片操作 `s[i:j]` 不拷贝数据，只生成新的三元组。

```go
type slice struct {
    array unsafe.Pointer // 指向底层数组
    len   int            // 当前长度
    cap   int            // 底层数组从 array 起的容量
}
```

共享底层数组是效率来源，也是坑的来源：

+ 由于 slice 不额外持有数据，对 slice 进行 append 会覆盖原数组对应的下一位。
+ 从巨大 slice 上切一小段长期持有，会导致整个数组无法被 GC。解法是用 `copy` 把数据挪到新 slice。
+ `copy(dst, src)` 按 `min(len(dst), len(src))` 拷贝并返回拷贝数量。
+ `append` 是唯一的追加手段。它返回一个更新后的切片，务必写成 `s = append(s, x)` 接收返回值。
+ Go 1.21 加入了内置函数 `min`/`max`/`clear`（`clear` 可清空 map 或将 slice 元素置零）并引入了 `slices`、`maps` 标准库包，`slices.Contains`、`slices.Sort` 不再需要手写。
+ nil slice（`var s []int`）与空 slice（`[]int{}`）行为几乎一致（len/cap 都是 0，都可以 append），但 `s == nil` 判断结果不同，JSON 序列化一个是 `null` 一个是 `[]`。

```go
n := copy(dst, src)    // 拷贝 min(len(dst), len(src)) 个元素，返回拷贝个数
s := []int{1, 2, 3, 4, 5}
sub := s[1:3]        // len=2, cap=4，与 s 共享底层数组，不拷贝数据，
sub = append(sub, 99) // 务必接收返回值；没超 cap，直接写入底层数组：s[3] 被改成了 99！
fmt.Println(s)        // [1 2 3 99 5]

safe := s[1:3:3]      // 完整切片表达式 s[low:high:max]，把 cap 限制为 2
safe = append(safe, 7) // 超出 cap，触发扩容拷贝，不再污染 s
```

string 在运行时是一个二元组。它没有 cap，因此能安全共享、可以做 map 的键、子串操作 `s[1:3]` 零拷贝。

```go
type stringStruct struct {
    str unsafe.Pointer
    len int
}
```

- `string` 和 `[]byte` 的互转都会发生内存拷贝（因为一个不可变一个可变，必须隔离）。编译器对少数模式做了免拷贝优化，例如 `m[string(b)]` 作 map 查询、`string(b) == s` 作比较时不会真的分配。Go 1.20 提供了 `unsafe.String`/`unsafe.SliceData` 用于确知安全时的零拷贝转换，但要慎用。
- 对 string 下标索引 `s[i]` 得到的是 `byte` 而不是字符；`for range` 遍历则按 UTF-8 解码逐 `rune` 迭代，索引可能跳跃，遍历时遇到非法 UTF-8 字节会产出替换字符 U+FFFD。
- 因为不可变，`+` 拼接每次都会分配新串。`fmt.Sprintf` 的拼接方式更灵活但更慢。
- 拼接大量字符串时用 `strings.Builder`：它内部维护一个 `[]byte`，`String()` 方法通过 unsafe 指针转换直接把字节切片"变成"字符串而不拷贝（安全性靠 Builder 禁止拷贝和继续写入来保证）。

```go
s := "Go语言"
fmt.Println(len(s)) // 8，len() 返回字节数而非字符数
for i, r := range s {
    fmt.Printf("%d:%c ", i, r) // 0:G 1:o 2:语 5:言（i 是字节偏移，可能跳跃）
}
rs := []rune(s)      // 按码点拆分，O(n) 且分配内存
fmt.Println(len(rs)) // 4

var b strings.Builder
for i := 0; i < 100; i++ {
    b.WriteString("x")
}
result := b.String() // 零拷贝取出结果
```

## map

map 是 Go 内置的哈希表，类型写作 `map[K]V`。使用层面：

- 键类型必须是可比较的（comparable）：数值、字符串、指针、channel、interface、以及只含可比较字段的数组/结构体。slice、map、函数不能做键。
- map 的 value 不可寻址，要改得取出整个 value 改完再放回（和 range 的值拷贝是同一套值语义）。
- 未初始化的 nil map（`var m map[string]int`） **可读不可写**，读会返回零值但写入会 panic。
- `v, ok :=` 的 comma-ok 模式是 Go 表达"可能不存在"的惯用法。

```go
m := make(map[string]int, 16) // 可指定初始容量提示
m["a"] = 1
v := m["b"]          // 键不存在返回零值 0，不会 panic
v, ok := m["b"]      // comma-ok 惯用法，ok 表示键是否存在
delete(m, "a")
for k, v := range m { fmt.Println(k, v) } // 遍历顺序随机！
```

Go 1.23 以前的 map 是经典的桶式哈希表，核心结构是 `runtime/map.go` 里的 `hmap`：

- `hmap` 记录元素个数 `count`、桶数量的对数 `B`（桶数为 2^B）、桶数组指针 `buckets`、扩容期间的旧桶数组 `oldbuckets` 等。
- 每个桶（`bmap`）固定存 8 个键值对：先是 8 个 `tophash` 字节（哈希值高 8 位，用于快速过滤），然后 8 个 key 连续存放、8 个 value 连续存放，最后一个溢出桶指针。桶装满后挂溢出桶链。
- 负载因子超过 6.5（平均每桶 6.5 个元素）时触发翻倍扩容；溢出桶过多时触发等量扩容整理。扩容是渐进式的：不是一次性搬迁，而是每次写操作顺带搬迁一两个旧桶（evacuation），把成本摊到多次操作上——这个思路和 Redis 的渐进式 rehash 一致。
- 遍历顺序随机是有意为之：迭代从一个随机桶、随机槽位开始。早期版本的遍历顺序恰好稳定，大量程序无意中依赖了它，官方索性在运行时主动随机化，逼你不要依赖顺序。

Go 1.24 把 map 的底层实现整体换成了 Swiss Tables（借鉴 abseil 的开放寻址 + SIMD 分组探测设计）。

map 不是并发安全的：并发读没问题，只要有并发写（或读写并发）就会被 runtime 检测到并直接 `fatal error: concurrent map writes`——注意这是不可 recover 的崩溃，不是 panic。并发方案有两种：

```go
// 方案一：互斥锁保护，通用
var mu sync.RWMutex
mu.Lock()
m["a"] = 1
mu.Unlock()

// 方案二：sync.Map，适合读多写少、键集合基本稳定的场景
var sm sync.Map
sm.Store("a", 1)
if v, ok := sm.Load("a"); ok {
    fmt.Println(v.(int))
}
```

`sync.Map` 内部维护 read、dirty 两个 map：read 支持无锁的原子读，miss 次数积累到阈值后把 dirty 提升为 read。它对"读远多于写"的场景很快，但泛用性差——它至今（含 1.24+）没有泛型 API，键值都是 `any`，取值永远要一次类型断言——官方文档也明说大多数场景直接用 `Mutex + map` 更合适。

## 结构体

struct 用字段名和类型定义，初始化有按字段名和按位置两种姿势。

+ 字段标签（tag） 用反引号标注，本身对编译器透明，由标准库或第三方通过反射消费，最典型的就是 `encoding/json` 读取 `json:"name,omitempty"` 决定序列化字段名和省略规则。
+ 如果结构体的所有字段都可比较（不含 slice/map/func），则结构体可比较（`==`），也可以作 map 的 key。

```go
type User struct {
	Name string `json:"name,omitempty"` // 字段标签（tag）：供反射读取的元数据
	Age  int    `json:"age"`
}

u1 := User{Name: "jimmy", Age: 18} // 按字段名初始化，推荐
u2 := User{"jimmy", 18}            // 按位置初始化，字段顺序变了就完蛋
var u3 User                        // 零值直接可用：Name="", Age=0
```

内存布局方面，Go 结构体按声明顺序排列字段，并按对齐要求插入 padding，**编译器不会重排字段**：

```go
type Bad struct { // 24 字节
    A bool  // 1 字节 + 7 padding
    B int64 // 8
    C bool  // 1 + 7 padding
}

type Good struct { // 16 字节
    B int64 // 8
    A bool  // 1
    C bool  // 1 + 6 padding
}
```

**逃逸分析（*escape analysis*）**：Go 里"分配在栈还是堆"不是由开发者的写法决定，而是由编译器分析变量是否逃出函数作用域决定。返回局部变量的指针是完全合法的——它会被分配到堆上：

```go
func newRect() *Rect {
    r := Rect{Width: 1} // r 逃逸到堆
    return &r           // 合法且惯用
}
```

Go 没有构造函数，有逃逸分析的存在，惯例是写一个 `NewXxx()` 工厂函数：

```go
func NewUser(name string) *User {
	return &User{Name: name} // 返回局部变量的指针完全合法（见“逃逸分析”）
}
```

用 `go build -gcflags=-m` 可以看到每个变量的逃逸决策。常见逃逸原因：指针被返回、被存进 interface、被闭包捕获、大小超阈值、被发送进 channel。性能调优时减少逃逸就是减少 GC 压力。

## 函数 Function 和方法 Method

**函数（Function）**是独立的代码块，通过 `func` 关键字声明，通过函数名直接调。**方法（Method）**是绑定在特定类型上的函数——它在 `func` 和函数名之间多一个接收者（Receiver）声明，表示"这个函数属于谁"：

```go
func Add(a, b int) int { return a + b }  // 函数

type Rect struct {
    Width, Height float64
}
func (r Rect) Area() float64 { // 值接收者：操作的是副本
    return r.Width * r.Height
}
func (r *Rect) Scale(f float64) { // 指针接收者：可修改原值
    r.Width *= f
    r.Height *= f
}

r := Rect{Width: 3, Height: 4}
r.Scale(2)          // 编译器自动取址，等价于 (&r).Scale(2)
fmt.Println(r.Area())
```

- 值接收者 vs 指针接收者的选择：需要修改接收者、或结构体较大不想拷贝时用指针；小型不可变结构体用值。同一类型的方法集应保持一致，不要混用。
- 一个重要细节：`*T` 的方法集包含值接收者和指针接收者的所有方法，而 `T` 的方法集只含值接收者方法。这在赋值给 interface 时会现形——只有 `&r` 能满足含指针接收者方法的接口，`r` 不行。
- 调用时的自动取址/解引用是语法糖。语法糖要求操作数可寻址，即 interface 由于动态没有这层糖。

Go 用 **嵌入（*embedding*）** 实现组合复用，字段和方法会被"提升"到外层（非标准的继承和多态）：

```go
type Animal struct{ Name string }

func (a Animal) Speak() string { return a.Name + " speaks" }

type Dog struct {
    Animal      // 匿名嵌入
    Breed string
}

d := Dog{Animal: Animal{Name: "Rex"}, Breed: "Husky"}
fmt.Println(d.Speak()) // 提升的方法，实际是 d.Animal.Speak()
```

## 接口 Interface

接口是 Go 类型系统的核心抽象。它声明一组方法集合，任何类型只要实现了全部方法就**自动**满足接口。

```go
type Stringer interface {
    String() string
}

type Point struct{ X, Y int }

func (p Point) String() string { // 没有任何"我要实现 Stringer"的声明
    return fmt.Sprintf("(%d, %d)", p.X, p.Y)
}

var s Stringer = Point{1, 2} // 自动满足
```

隐式实现的好处是解耦：接口可以定义在消费方，被实现类型甚至不需要知道接口的存在。代价是没有 Rust trait 那样清晰的实现关系导航，也没有默认方法、关联类型这些能力。想显式确认可以用编译期断言惯用法 `var _ Stringer = Point{}`。社区奉行小接口哲学：接口越小越好，标准库里大量单方法接口。配套的格言是 **accept interfaces, return structs**（参数收接口，返回值给具体类型）。

底层实现上，interface 值是一个胖指针结构，空接口和非空接口的定义不同：

```go
type iface struct { // 非空接口
    tab  *itab          // 类型信息 + 方法表
    data unsafe.Pointer // 指向实际数据
}

type eface struct { // 空接口 interface{}
    _type *_type        // 只有类型信息，没有方法表
    data  unsafe.Pointer
}
```

- `itab` 缓存了（接口类型，具体类型）配对的方法函数指针数组，首次转换时生成并存入全局哈希表，之后复用。即接口方法调用就是一次查表间接调用，**动态分发**，比直接调用多一次指针跳转，且通常无法内联。
- 把具体值装入 interface 时有**装箱成本**：Go 1.4 起 data 字只允许存指针（为了让 GC 能精确扫描），非指针值不再直接内联进 interface——所以任何非指针类型装箱原则上都要在堆上分配一份拷贝，哪怕 `int` 这种恰好一个字宽的类型也不例外（runtime 给 0~255 的小整数等备了静态缓存，可以免分配）。

|          | Go                | Rust                                                         |
| :------- | :---------------- | ------------------------------------------------------------ |
| 动态分发 | interface，胖指针 | `&dyn Trait`，胖指针                                         |
| 静态分发 | 没有对应物        | 泛型 `fn f<T: Trait>(x: T)`：编译期为每个具体类型生成一份专用代码 |

**interface 值等于 nil，当且仅当类型字 tab 和数据字 data 都为 nil**。下列 `do()` 函数即使在未出错的情况下也会使得返回的 `err` 满足 `err != nil`，修复方式是让函数在无错时显式 `return nil`。

```go
type MyErr struct{}

func (e *MyErr) Error() string { return "boom" }  // 使得 MyErr 满足了 error 接口的要求

func do() error {
    var e *MyErr = nil
    // 省略如果出错了就把 e 赋值成 &MyErr{...} 的过程
    return e // 如果 e=nil，返回的 error 里 tab 指向 *MyErr，data 为 nil
}

func main() {
    if err := do(); err != nil {
        fmt.Println("有错误？", err) // 会走到这里！err != nil 成立
    }
}
```

**类型断言** 与 **type switch** 用于从接口里取回具体类型：

```go
var i interface{} = "hello"

s := i.(string)      // 断言失败会 panic
s, ok := i.(string)  // comma-ok 形式，失败时 s 为零值、ok 为 false

switch v := i.(type) { // type switch
case string:
    fmt.Println("string:", v)
case int:
    fmt.Println("int:", v)
case nil:
    fmt.Println("nil interface")
default:
    fmt.Printf("unknown: %T\n", v)
}
```

空接口 `interface{}` 没有任何方法，所有类型都满足它，是泛型出现前 Go 表达"任意类型"的唯一手段。Go 1.18 引入了别名 `any = interface{}`，现在新代码一律写 `any`。当然能用泛型就不用 `any`。

接口可以组合（嵌入），如 `io.ReadWriter` 就是 `Reader` + `Writer`。接口值之间可以用 `==` 比较：动态类型相同且动态值相等则相等；若动态类型本身不可比较（比如 slice），比较会在运行时 panic。

常见接口一览：

| 接口             | 方法签名                                         | 用途                                     |
| ---------------- | ------------------------------------------------ | ---------------------------------------- |
| error            | Error() string                                   | 错误值                                   |
| fmt.Stringer     | String() string                                  | 自定义打印格式，fmt 系列函数调用         |
| io.Reader        | Read(p []byte) (n int, err error)                | 抽象数据源                               |
| io.Writer        | Write(p []byte) (n int, err error)               | 抽象数据汇                               |
| io.Closer        | Close() error                                    | 资源释放                                 |
| sort.Interface   | Len() int / Less(i, j int) bool / Swap(i, j int) | sort.Sort 排序（新代码多用 slices.Sort） |
| http.Handler     | ServeHTTP(w ResponseWriter, r *Request)          | HTTP 请求处理                            |
| json.Marshaler   | MarshalJSON() ([]byte, error)                    | 自定义 JSON 编码                         |
| json.Unmarshaler | UnmarshalJSON([]byte) error                      | 自定义 JSON 解码                         |
| context.Context  | Deadline() / Done() / Err() / Value(key any)     | 取消信号与截止时间传递                   |

## 错误处理

Go 的错误处理哲学是：错误是普通的值。`error` 就是一个 interface：

```go
type error interface {
    Error() string
}
```

函数通常把 error 作为最后一个返回值，调用方显式检查：

```go
f, err := os.Open("config.yaml")
if err != nil {
    return fmt.Errorf("open config: %w", err) // %w 包装错误，保留错误链
}
defer f.Close()
```

这套模式的优点是控制流完全显式，没有隐藏的异常路径；缺点就是啰嗦，无法使用 `?`。

- Go 1.13 引入错误链机制：`fmt.Errorf` 的 `%w` 动词包装底层错误（被包装错误可通过 `Unwrap() error` 方法取出），配套三个工具函数：`errors.Is` 用于判断"是不是某个已知错误"，`errors.As` 用于取出"某个类型的错误"以读取字段，直接 `err == ErrNotFound` 在有包装的情况下会失效。
- Go 1.20 加了 `errors.Join` 合并多个错误。
- 惯例：包装错误的消息写"正在做什么"（`"open config:"`），不要写 `"failed to"` 层层堆叠。

```go
var ErrNotFound = errors.New("not found") // 哨兵错误

err := fmt.Errorf("query user 42: %w", ErrNotFound)

errors.Is(err, ErrNotFound) // true，沿错误链逐层比对哨兵值
var pathErr *os.PathError
errors.As(err, &pathErr)    // 沿错误链找指定类型并赋值
errors.Unwrap(err)          // 剥掉一层包装
```

`panic` 用于不可恢复的程序错误（数组越界、空指针解引用、逻辑断言失败）， 类似于 Rust 的 `panic!`，会进行栈展开、沿途执行 defer、最终打印堆栈退出。**`recover()` 只能在 defer 的函数中使用**（注意直接调用无效，得包闭包），能抓住 panic 的值并终止展开，让程序恢复正常执行，常用于 goroutine 顶层的兜底。

```go
func safeCall(f func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("panic recovered: %v", r) // 修改命名返回值
        }
    }()
    f()
    return nil
}
```

## 泛型

Go 1.18 引入了泛型，官方术语是**类型参数（*type parameters*）**。社区为此吵了十几年，最终设计相当克制。

| 能力                                                       | Go 泛型                |
| ---------------------------------------------------------- | ---------------------- |
| 类型参数 + 约束                                            | ✅ 有                   |
| 特化（某个类型走特殊实现，如 C++ template specialization） | ❌ 没有                 |
| 运算符重载配合泛型                                         | ❌ 没有                 |
| 泛型方法（方法自带类型参数）                               | ❌ 只有类型和函数能泛型 |

以 Map 和 Max 两种用法举例：

```go
func Map[T, U any](s []T, f func(T) U) []U {
    r := make([]U, 0, len(s))
    for _, v := range s {
        r = append(r, f(v))
    }
    return r
}

doubled := Map([]int{1, 2, 3}, func(x int) int { return x * 2 }) // 类型实参自动推导

func Max[T constraints.Ordered](a, b T) T {
    if a > b { return a }
    return b
}

Max(3, 5)       // T=int，返回 5
Max("a", "b")   // T=string，返回 "b"
```

泛型语境下，接口从描述**方法集合**扩展为描述**类型集合**。此时的接口被称为**约束（*constraint*）**。

```go
type Number interface {
    ~int | ~int64 | ~float64 // ~ 表示底层类型是它的所有类型（含自定义类型）
}

func Sum[T Number](s []T) T {
    var total T
    for _, v := range s {
        total += v
    }
    return total
}
```

- `~int` 中的波浪号表示"底层类型为 int 的所有类型"，这样 `type MyInt int` 也能满足约束。
- 内置约束有 `any`（任意类型）和 `comparable`（可用 `==` 比较，做 map 键的约束）。

常用约束最初放在扩展包 `golang.org/x/exp/constraints`（`constraints.Ordered` 等）。Go 1.21 把最常用的 `Ordered` 收编进了标准库 `cmp` 包（`cmp.Ordered`、`cmp.Compare`），同期的 `slices`/`maps` 包就是泛型的第一批标准库成果。

Go 的泛型实现机制与 Rust 有本质区别。

+ Rust 泛型完全单态化：每个具体类型实例化出一份独立代码，零运行时开销，代价是编译慢、二进制膨胀。
+ Go 采用的是 GC shape stenciling + 字典的混合方案：**指针形状相同的类型共享同一份实例化代码**（所有指针类型共用一份，如 `int` 和 `int64` 则各一份），再通过隐式传入的字典在运行时区分具体类型信息。结果是编译速度和二进制体积可控，但泛型代码可能比手写具体类型略慢（字典查找可能阻碍内联）。

当前限制（截至 Go 1.18 落地的设计，多数至今未变）：

- **方法不能有自己的类型参数**。`func (r Repo[T]) Find[U any](...)` 不合法，只能把类型参数放在类型上或改用顶层函数。这是被吐槽最多的限制，因为它阻碍了函数式风格的链式 API。
- 没有特化（specialization），不能为特定类型提供优化实现。
- 约束只能描述方法集和类型集，不能表达"有某个字段"。
- 泛型类型的别名直到 Go 1.24 才支持（`type Set[T comparable] = map[T]struct{}`）。

所以 Go 泛型只适合写容器和工具函数（`slices`/`maps` 那种），不适合像 Rust 那样做重度的类型体操。

## 并发编程

并发是 Go 的招牌。用 `go` 关键字启动一个 goroutine：

```go
go func(msg string) {
    fmt.Println(msg)
}("hello") // 参数在 go 语句执行时求值
```

goroutine 是运行时调度的用户态协程，背后用了 GMP 调度模型：

- **G**（goroutine）：协程本体，初始栈仅 2KB，按需增长（栈拷贝方式，最大默认 1GB），这是"有栈协程"。对照 Rust 的 async：Rust 的 Future 是无栈的状态机，编译期把 async 函数展开成 enum，体积精确但有传染性（async 染色问题）；Go 的有栈协程没有函数染色，同步代码直接就是并发代码，代价是每个 G 至少 2KB 栈和栈增长检查。
- **M**（machine）：操作系统线程，实际执行代码的载体。
- **P**（processor）：逻辑处理器，数量默认等于 CPU 核数（`GOMAXPROCS`，Go 1.5 起默认为核数）。P 持有本地运行队列（容量 256），M 必须绑定 P 才能执行 G。

调度细节：新 G 优先进 P 的本地队列；本地队列空了就从全局队列取，再不行就从其他 P 偷一半任务。G 发生阻塞系统调用时，M 会与 P 解绑，P 交给其他 M 继续跑，保证核不空转。网络 IO 则由 netpoller（epoll/kqueue）接管，G 挂起让出 M，就绪后重新入队——这就是 Go 用同步写法达到异步性能的原理。

Go 1.14 引入基于信号（SIGURG）的异步抢占，解决了之前"纯计算的死循环 goroutine 饿死调度器"的问题。

channel 是 goroutine 间通信的一等公民（社区名言"*不要通过共享内存来通信，而要通过通信来共享内存*"）

```go
ch := make(chan int)        // 无缓冲：发送和接收必须同时就绪（同步交接）
buf := make(chan int, 10)   // 有缓冲：缓冲未满时发送不阻塞

go func() {
    buf <- 1
    close(buf) // 由发送方关闭
}()

v, ok := <-buf              // ok 为 false 表示 channel 已关闭且取空
for v := range buf {        // range 持续接收直到 channel 关闭
    fmt.Println(v)
}

func worker(in <-chan int, out chan<- int) {} // 方向限定：只收 / 只发
```

各种状态下的操作语义如下：

| 操作             | nil channel | 已关闭 channel                                               | 正常 channel |
| ---------------- | ----------- | ------------------------------------------------------------ | ------------ |
| 发送 `ch <- v`   | 永久阻塞    | **panic**                                                    | 阻塞或成功   |
| 接收 `<-ch`      | 永久阻塞    | 缓冲区还有值则正常取出（ok=true），<br>取空后立即返回零值（ok=false） | 阻塞或成功   |
| 关闭 `close(ch)` | **panic**   | **panic**（重复关闭）                                        | 成功         |

底层实现是 `runtime/chan.go` 的 `hchan` 结构：一个环形缓冲区 `buf`（配 `sendx`/`recvx` 两个游标）、等待发送的 goroutine 队列 `sendq`、等待接收的队列 `recvq`（元素是包装 G 的 `sudog`）、一把互斥锁 `lock`。

- 无缓冲 channel（或缓冲空但有接收者等待）的发送会直接把数据从发送方拷贝到接收方 goroutine 的栈上，绕过缓冲区，这是罕见的一个 goroutine 写另一个 goroutine 栈的场景。
- 阻塞的 goroutine 被打包成 sudog 挂进等待队列并让出调度，唤醒是精确的（FIFO 取队头），不存在惊群。
- 所以 channel 并不是无锁结构，超高竞争下它的那把锁也会成为瓶颈。

`select` 0在多个 channel 操作间实现多路复用。多个 case 同时就绪时**随机选择**一个（主动随机化，防止饥饿）；向 nil channel 的 case 永远不会被选中，所以把 channel 置 nil 是动态关闭某个 case 的惯用技巧。

```go
select {
case v := <-ch1:
    fmt.Println("recv", v)
case ch2 <- 42:
    fmt.Println("sent")
case <-time.After(time.Second):
    fmt.Println("timeout")
default: // 有 default 则不阻塞，实现非阻塞收发
    fmt.Println("nothing ready")
}
```

共享内存的同步原语在 `sync` 包：

| 类型           | 要点                                                         |
| -------------- | ------------------------------------------------------------ |
| sync.WaitGroup | `Add(n)` 计数、`Done()` 减一、`Wait()` 阻塞到归零；等待一组 goroutine 结束 |
| sync.Mutex     | 互斥锁，零值可用，不可重入；加锁后不得拷贝（vet 的 copylocks 检查会抓） |
| sync.RWMutex   | 读写锁，读锁可并发，适合读多写少                             |
| sync.Once      | `Do(f)` 保证 f 全局只执行一次，常用于懒初始化                |
| sync.Pool      | 临时对象池，复用对象减压 GC；池内对象随时可能被回收，别存状态 |
| sync.Cond      | 条件变量，极少用，channel 通常更合适                         |
| sync.Map       | 并发安全 map                                                 |

```go
var mu sync.Mutex         // 互斥锁，零值可用，不可重入
var rw sync.RWMutex       // 读写锁

var wg sync.WaitGroup     // 等待一组 goroutine 完成
wg.Add(1)
go func() {
    defer wg.Done()
    // work
}()
wg.Wait()

var once sync.Once        // 恰好执行一次（单例初始化）
once.Do(initialize)
```

对照 Rust：Go 的 `Mutex` 不包裹数据（Rust 是 `Mutex<T>`，锁和数据在类型上绑定，忘了加锁编译不过），Go 靠自觉和注释约定"此字段由 mu 保护"。数据竞争检测靠运行时的 `-race`：它基于 ThreadSanitizer，会让程序慢 5~10 倍，但 CI 里跑 `go test -race` 应当是铁律。

`context` 是取消信号和超时在调用链上的标准传播机制，所有阻塞的库函数都应接受它：

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel() // 务必调用，否则泄漏计时器资源

select {
case <-ctx.Done():
    return ctx.Err() // context.DeadlineExceeded 或 context.Canceled
case result := <-doWork(ctx):
    return result
}
```

四个构造函数：`WithCancel`（手动取消）、`WithTimeout`（时长）、`WithDeadline`（截止时刻）、`WithValue`（塞请求级元数据，慎用于传业务参数）。context 树形嵌套，父 context 取消时所有子 context 一并取消。惯例是 **ctx 作为第一个参数传递**。它解决的问题正是 goroutine 没有外部终止手段——你不能 kill 一个 goroutine，只能靠它自己检查 `ctx.Done()` 自觉退出，否则就是 goroutine 泄漏。

## 测试

Go 把测试直接做进了语言和工具链：测试文件以 `_test.go` 结尾、与被测代码同目录，函数签名 `func TestXxx(t *testing.T)`，`go test` 一条命令跑完，不需要任何第三方框架。

- 表驱动测试是 Go 社区的标志性写法：用例是数据，断言逻辑只写一遍，加用例就是加一行。
- `t.Run` 划分子测试：每个用例有独立名字，可以用 `go test -run 'TestDivide/by_zero'` 精确到单个子用例，也可以在子测试里调 `t.Parallel()` 并行执行。
- `t.Helper()` 标记测试辅助函数：失败时报告的行号指向调用方，而不是辅助函数内部。
- 测试结果默认有缓存：代码与输入没变时 `go test` 直接回放上次结果（输出带 `(cached)`），加 `-count=1` 强制重跑——排查偶发失败时必备。

```go
func TestAdd(t *testing.T) {
	tests := []struct {
		name string
		a, b int
		want int
	}{
		{"正数", 1, 2, 3},
		{"含零", 0, 5, 5},
		{"负数", -1, -1, -2},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) { // 子测试，可单独运行和定位
			if got := Add(tt.a, tt.b); got != tt.want {
				t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
			}
		})
	}
}
```

两个辅助设施：`t.Run` 划分子测试（Go 1.22 之前闭包捕获循环变量需要 `tt := tt` 防坑，现在不用了）；`t.Helper()` 标记测试辅助函数，让失败定位到调用处而不是辅助函数内部。

测试结果是带缓存的，加 `-count=1` 强制重跑；子测试里调 `t.Parallel()` 可让用例并行执行。

```bash
go test ./...                    # 跑当前 module 所有包
go test -run 'TestAdd/正数' -v .  # -run 按正则筛选，可精确到子测试
go test -race -cover ./...       # 竞态检测 + 覆盖率
go test -bench . -benchmem .     # 跑基准测试并报告内存分配
```

基准测试写 `func BenchmarkXxx(b *testing.B)`，循环次数 `b.N` 由框架动态校准到统计稳定；Go 1.24 引入了 `for b.Loop()` 的新写法，除了更简洁，还能防止编译器把"结果没被使用"的被测代码优化掉：

```go
func BenchmarkDivide(b *testing.B) {
    for b.Loop() { // Go 1.24；老写法是 for i := 0; i < b.N; i++
        Divide(6, 3)
    }
}
```

示例测试写 `ExampleXxx`，尾部的 `// Output:` 注释会被真实执行并校验，既是测试又是文档，会展示在 pkg.go.dev 的文档页上。`Xxx` 必须对应包内真实存在的标识符（通常是导出函数），`go vet` 会校验这一点：

```go
func ExampleDivide() {
    v, _ := Divide(6, 3)
    fmt.Println(v)
    // Output: 2
}
```

Go 1.18 起内置了模糊测试（`func FuzzXxx(f *testing.F)`）。测试、基准、模糊、示例文档四位一体全在标准工具链里。第三方生态 [testify](https://github.com/stretchr/testify) 的 `assert`/`require` 是事实标准，能把三行 if 断言压成一行，一句带过。

## 常用标准库速览

`fmt` 的格式化动词：

| 动词                      | 含义                                              |
| ------------------------- | ------------------------------------------------- |
| `%v`                      | 默认格式；`%+v` 结构体带字段名；`%#v` Go 语法表示 |
| `%T`                      | 值的类型                                          |
| `%d` / `%b` / `%o` / `%x` | 十/二/八/十六进制整数                             |
| `%f` / `%e` / `%g`        | 浮点数（定点 / 科学计数 / 自动）                  |
| `%s` / `%q`               | 字符串 / 带引号并转义的字符串                     |
| `%c` / `%U`               | Unicode 字符 / 码点（U+4E2D）                     |
| `%t`                      | 布尔                                              |
| `%p`                      | 指针地址                                          |
| `%w`                      | 仅用于 `fmt.Errorf`，包装错误                     |

`strconv` 负责字符串与基本类型的转换（比 `fmt.Sprintf` 快得多，热路径优先用它）：

```go
i, err := strconv.Atoi("42")
s := strconv.Itoa(42)
f, err := strconv.ParseFloat("3.14", 64)
b, err := strconv.ParseBool("true")
q := strconv.Quote(`hi "there"`) // 加引号转义
```

`time` 最出名的是它的布局字符串：不用 `%Y-%m-%d`，而是用一个固定的参考时间 `2006-01-02 15:04:05`（美式顺序的 1 2 3 4 5 6）作为模板：

```go
now := time.Now()
s := now.Format("2006-01-02 15:04:05")
t, err := time.Parse(time.RFC3339, "2026-07-15T06:30:00Z")

d := 150 * time.Millisecond      // time.Duration 是 int64 纳秒
elapsed := time.Since(start)     // 常用于计时
timer := time.NewTimer(time.Second)
ticker := time.NewTicker(time.Minute)
defer ticker.Stop()
```

`encoding/json` 基于反射做序列化，行为完全由结构体 tag 控制：

- 只有导出字段会被处理。
- JSON 数字反序列化进 `any` 时统一变成 `float64`，大整数会丢精度，需要精确处理时用 `json.Number`。

```go
type User struct {
    ID      int64   `json:"id"`
    Name    string  `json:"name,omitempty"` // 零值时省略该字段
    Email   *string `json:"email,omitempty"`
    Secret  string  `json:"-"`              // 永不序列化
    private string  // 未导出字段直接忽略
}

data, err := json.Marshal(u)
err = json.Unmarshal(data, &u) // 必须传指针
```

Go 1.23 引入了迭代器（range over func）：`for v := range seq` 里的 `seq` 可以是 `func(yield func(V) bool)` 形式的函数，配套的 `iter` 包定义了 `iter.Seq[V]` 和 `iter.Seq2[K, V]`，标准库的 `slices.Values`、`maps.Keys` 等都已改造为返回迭代器。Go 终于有了基础的惰性序列的统一抽象。

## 反射与代码生成

`reflect` 包提供运行时的类型自省与操纵能力，前文多次出现的结构体 tag、`encoding/json`、还有各类 ORM 和依赖注入框架，全部建立在它之上。Rob Pike 用三条定律（The Laws of Reflection）概括了它的使用规则：

- 定律一：反射从 interface 值出发。`reflect.TypeOf(x)` / `reflect.ValueOf(x)` 的参数是 `any`——值先装箱成 interface，反射再从 eface 的类型字和数据字里把信息拆出来。
- 定律二：反射对象可以还原回 interface 值，即 `v.Interface()`，与定律一互逆。
- 定律三：要通过反射修改值，`Value` 必须可设置（settable）——必须从指针出发再 `Elem()`，对不可设置的 Value 调 `Set` 系列方法会 panic。

```go
x := 3.14
v := reflect.ValueOf(&x).Elem() // 定律三：从指针 Elem() 拿到可设置的 Value
fmt.Println(v.CanSet())         // true；reflect.ValueOf(x) 拿到的则是 false
v.SetFloat(2.71)                // x 被改成 2.71
```

结构体 tag 的读取也在这里补全前文埋的线：

```go
f, _ := reflect.TypeOf(User{}).FieldByName("Name")
fmt.Println(f.Tag.Get("json")) // name,omitempty
```

json 库做的事情就是遍历字段、读出 tag、按规则编码，如此而已。但反射要克制着用：它比直接调用慢一个数量级以上，常伴随装箱分配，更重要的是把类型错误从编译期推迟到了运行期 panic。

Go 没有宏，元编程的官方答案是代码生成。在源码里写一行指令注释：

```go
//go:generate stringer -type=Weekday
```

执行 `go generate ./...` 会扫描并运行这些命令。`stringer` 会为前文那种 iota 枚举生成 `String()` 方法，是入门代码生成的标准例子；protobuf 的 protoc、打桩用的 mockgen 都是同一套路。工具本身用 `go install` 安装，Go 1.24 起还可以在 go.mod 里用 `tool` 指令把这类工具依赖纳入版本管理。

条件编译也归这套体系管：文件顶部写 `//go:build linux && amd64`（Go 1.17 起的布尔表达式语法，取代旧的 `// +build`），该文件就只在满足条件时参与编译；纯平台差异的场景连标签都可以省——文件名后缀 `foo_linux.go` 自带条件编译效果。
