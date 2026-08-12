---
categories: Lang
cover: ../post_images/Rust.jpg
date: 2022-05-04 09:56:47
description: 记录了我对 Rust 语言的系统性学习。
tags: [Digest, Rust]
title: Rust 基础语法
updated: 2026-05-21
---

这篇博文我将详细介绍 Rust 这门语言。从创建本博客至此刻大更新（2026-5），我的 Rust 开发经验已是四年有余了——我认为它是互联网厂商泛工程开发中最合适的语言。根据我的体验，它至少拥有以下优点：

+   好用的语言特性。可提高安全性的强语言类型、提高开发效率的自动类型推导、成熟的流操作等等。
+   舒适的开发环境。VSCode+RA，rust-fmt 和 rust-clippy 等工具让代码开发成为一种享受。
+   良好的异步引擎。不用基于麻烦的回调或 Webflux，像同步代码一样写异步！
+   高效。据传 Rust 和 C 的代码速度比是 1.07:1。这个特性让 Rust 能用在量化交易系统和链上系统。
+   安全。这是 Rust 被吹得最多的一点，诸如“内存绝对安全“、”只要过编译就罕有 bug”。我对这个特性的认知比较保守：至少，Rust 拥有一个强大的编译器，借用检查、生命周期等机制能有效降低内存泄漏的可能性。
+   优秀的包管理系统和良好的生态。Cargo 不能说是最强的包管理系统，但肯定是好用者之一。

Rust 的缺点不多，体感最强烈的是编译速度太慢。~~一般我敲入编译或测试的命令时就会去茶水间打水~~。

## 环境安装和资料推荐

Rust 的编译工具是 rustc（2026-04-17 版本 1.95.0），由工具 rustup 进行管理。

rustup 按 [官网](https://www.rust-lang.org/zh-CN/tools/install) 指示进行下载安装。安装完成后可以在 `~/.cargo/bin` 看到 rustup、rustc、cargo、rustfmt、rust-gdb 等一系列工具。Rust 依赖 C 的编译环境，所以针对不同的操作系统和 C 语言依赖有 [不同的版本](https://doc.rust-lang.org/rustc/platform-support.html)。用 `rustup toolchain` 来管理可能存在的多个版本。Linux 下自然依赖 gnu，而 Windows 推荐依赖 msvc。

Rust 开发环境推荐 VSCode + Rust Analyzer 插件或 Intellij-Rust，我用的是前者。

下面推荐一些 Rust 的教程和资料：

| 网址                                                         | 描述                                     |
| ------------------------------------------------------------ | ---------------------------------------- |
| https://crates.io/                                           | Rust 官方的包平台                        |
| https://rust.godbolt.org/                                    | 将 rust 代码翻译为汇编的工具             |
| [The Rust Progamming Language](https://doc.rust-lang.org/stable/book/)（[Rust 程序设计语言](https://rustwiki.org/zh-CN/book/)） | Rust 官方教程，有中文翻译版              |
| [Rust 语言圣经](https://course.rs/about-book.html)（Rust Course） | 中文社区教程，~~突出贡献者居然是我同事~~ |
| [Rust by Example](https://doc.rust-lang.org/rust-by-example/) | 带有大量代码示例的教程                   |
| [Rust Async Book](https://rust-lang.github.io/async-book/)   | Rust 中的异步编程                        |
| [The Rustonomicon](https://doc.rust-lang.org/nomicon/)       | Rust 前沿特性教程，不推荐初学者          |

常见的代码测试、格式化等命令参考：

```bash
cargo test [options] [testname] [-- test-options]
cargo test -- --nocapture                          # print normal messages like logs
cargo test functionname                            # run all tests filter by name
cargo test --test [filename] -- [functionname]     # only run the specific test
cargo test --all-features                          # activate all available features

cargo clippy
cargo clippy --fix --allow-dirty --allow-staged    # check include modified, auto fix
cargo sort [path]                                  # sort toml
cargo +nightly fmt                                 # format code
cargo +nightly udeps                               # remove unused package
```

由于 Rust 极度依赖泛型和内联优化，会导致编译器生成大量重复的底层代码和海量的调试信息。Windows 下 Rust 默认使用 VS 提供的 `link.exe` 进行链接，其内存管理效率非常低下，容易导致 Out of Memory。LLVM 为 Rust 定制了 `rust-lld.exe` 链接器，其内部数据结构和内存分配策略远比传统的 `link.exe` 优秀：

```bash
cargo install -f cargo-binutils
rustup component add llvm-tools-preview

# in ~/.cargo/config
[target.x86_64-pc-windows-msvc]
linker = "rust-lld.exe"
```

## 包管理

一个 Rust 项目里通常含有以下几项：

| 路径         | 功能                                                         |
| ------------ | ------------------------------------------------------------ |
| `Cargo.toml` | 清单文件。声明本项目直接依赖的三方库版本，以及一些构建、特性等配置。 |
| `Cargo.lock` | 锁文件。由 Cargo 包管理器生成和维护，记录了整个依赖树（直接/间接依赖）的确切版本。 |
| `src/*`      | 源码目录。包括程序入口 `main.rs`，提供给外界用的 `lib.rs` 等。 |
| `tests/*`    | 集成测试目录。小型的单元测试通常直接写在源码文件内。         |
| `examples/*` | 典型使用示例。可通过 `cargo run --example <name>` 独立运行。 |
| `benches/*`  | 基准测试 (Benchmark) 目录，用于性能测速。                    |

包（*Package*）是提供一系列功能的集合，包含一个 `Cargo.toml`。一个包包含零个或一个库（*Library Crate*），以及任意多个二进制项（*Binary Crate*）。`src/main.rs` 是默认的二进制根节点，`src/lib.rs` 是默认的库根节点。若需添加更多二进制项，可放置在 `src/bin/` 目录下。

模块（*mod*）用于在一个 Crate 内部对代码进行分组、嵌套与作用域控制。

+ 可见性规则：模块、函数、结构体及其字段默认私有。父模块无法访问子模块的私有项，但子模块可以无条件访问父模块及祖先模块的内容。枚举的成员默认与其枚举本体的可见性一致。
+ 权限暴露：使用 `pub` 关键字可将其标记为公有，使其对上一层级可见。若需跨越多层暴露，需在每一层级进行 `pub` 声明。 `pub(crate)` 指同 Crate 下的所有模块都能调用但外部依赖看不见，同理还有 `pub(super)`。

路径的调用与导入：

+ 绝对路径：从 Crate 根节点开始，以 `crate::` 引导。
+ 相对路径：以当前模块 (`self::`) 或父模块 (`super::`) 引导，也可直接以同级模块名开头。
+ 导入与重导出：使用 `use` 可以将较长的路径引入当前作用域（类似软链接），结合 `as` 可进行重命名，`.*` 用于引入模块下的所有公有项。若在 `use` 前加上 `pub`（即 `pub use`），则称为重导出（*re-exporting*），常用于对外展平内部深层嵌套的模块结构。

在处理大量同源导入时，可以使用嵌套路径（使用 `{}` 与 `self`）来简化代码：

```rust
// 优化前的冗长导入
use std::cmp::Ordering;
use std::io;
use std::io::Write;

// 优化后的嵌套导入
use std::{cmp::Ordering, io::{self, Write}};
```

可以使用 `cargo tree` 命令在终端中查看当前项目已解析并使用的 Crate 树型依赖关系。

## 基本语法

Rust 支持类型推理。用 `let` 指定不可变变量，`let mut` 指定可变变量。

+ 用 `const` 修饰（全局）常量。需指明类型，没有固定的内存地址，值无法改变（不能加 `mut` 前缀）。
+ 用 `static` 修饰（全局）静态变量。需指明类型，具有固定的内存地址。可以加 `mut` 前缀表示可变的静态变量，但访问和修改可变静态变量是非安全的（只能通过 `unsafe` 块），因为有多线程下的数据竞争问题。注意 `static mut` 已被 Rust 2024 Edition 弃用，推荐使用原子类型。

```rust
let x = 5;
let mut y = 5u32;
y = 6_222;
let z = {
    let x = 0o77;
    x + 1
};
static mut COUNTS: u32 = 0;
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

Rust 支持变量遮蔽（*shadow*），遮蔽前后类型可以不同，作用域结束后遮蔽自动结束。

```rust
let x = 1;
{
    let x = x * 2;
    println!("The value of x in the inner scope is: {}", x); // 2
}
println!("The value of x is: {}", x); // 1
```

函数参数和返回值（如果有）必须指定类型。函数定义的位置不作要求。如果没有返回值，默认返回 `()`。

`if` 判断的表达式必须返回布尔类型，表达式无须强制套小括号。`if` 表达式返回的结果必须同类型。

```rust
let number = if condition { 5 } else { 6 };
```

用 `loop`，`while` 和 `for` 来表示循环。支持 `continue` 和 `break`。`break` 后可添加返回值来构建表达式。

```rust
let result = loop {
    counter += 1;
    if counter == 10 {
        break counter * 2;
    }
};
while number != 0 {
    println!("{}!", number);
    number -= 1;
}
for element in (1..4).rev() {
    println!("the value is: {}", element);
}
```

## 基本数据类型

Rust 是一种强类型（*strongly typed*）和静态类型（*statically typed*）语言。

Rust 的原生类型（*primitives type*）分为标量类型（*scalar type*）和复合类型（*compound type*）。

标量类型主要有以下四种：

+ 整型：`i8, i16, i32, i64, i128, isize; u8, u16, u32, u64, u128, usize`。字面量未声明默认是 `i32`。整型溢出（*integer overflow*）：debug 模式下报 panic 错误，release 模式下用补码包裹。
+ 浮点类型：`f32, f64`。字面量未声明默认是 `f64`。与 `Nan` 交互都会变成 `NaN`。
+ 布尔类型：`bool`。大小为 1 字节。
+ 字符类型：`char`。大小为 4 字节，Unicode 编码，用单引号表示。用 `b'x'` 表示字符 x 的 ASCII 值。

**序列**（*range*）用来生成连续的数值，默认前闭后开。如 `1..5`，`1..=5`。常用于 `for...in...`。

| 范围表达式 |             类型             |      范围       | match arm 是否支持 |
| :--------: | :--------------------------: | :-------------: | :----------------: |
|    `..`    |    `std::ops::RangeFull`     |                 |     最早就支持     |
|  `s..=t`   |  `std::ops::RangeInclusive`  | $s \le x \le t$ |  Rust 1.26+ 支持   |
|   `s..`    |    `std::ops::RangeFrom`     |    $s \le x$    |  Rust 1.66+ 支持   |
|   `..=t`   | `std::ops::RangeToInclusive` |    $x \le t$    |  Rust 1.66+ 支持   |
|   `s..t`   |      `std::ops::Range`       |  $s \le x < t$  |  Rust 1.80+ 支持   |
|   `..t`    |     `std::ops::RangeTo`      |     $x < t$     |  Rust 1.80+ 支持   |

**元组**（*tuple*）可以将多个不同类型的值复合在一起，可以用模式匹配或 `.` 配合下标来索引。

**单元类型**（*unit type*）是一种特殊的元组，只有一个值 `()`，称为单元值（*unit value*），不占用内存。如果表达式或函数不返回任何其他值，就隐式地返回单元值。如果 Map 不关心键值，也可以用 `()` 占位。

```rust
let tuple = (500, 6.4, 1);
let (x, y, z) = tup;
let six_point_four = tuple.1;
struct Point(i32, i32, i32);
let origin = Point(0, 0, 0);
```

**数组**（*array*）只能组合同类型的元素，长度是不可变的常量。数组内容会被分配至栈空间中。

**数组切片**（*slice*）可以部分或全部地引用数组，前闭后开。用 `&` 获得指向的地址，不实际拥有数据。切片相比原始数组的好处是长度确定，其本身一个胖指针（*fat pointer*），包含了地址和长度两个量。

```rust
let months = ["January", "February", "March"];
let a: [i32; 5] = [1, 2, 3, 4, 5]
let a = [3; 5]; // [3, 3, 3, 3, 3]
let first = a[0];
let slice: &[i32] = &a[1..3];
```

**never 类型**（*never type*）是一个没有值的类型，表示永远不会完成计算的结果，用 `!` 标记。`panic!` 、一直循环的 loop、match 分支里的 break/return 会被视为 never 类型。never 类型可以被转化成任何类型。

Rust 不提供原生类型之间的隐式类型转换。可以用 `as` 进行显式转换，原生类型中只支持四种转换：整数和浮点数之间互相转换，枚举类型转成整型，布尔类型或字符类型转成整型，`u8` 转成字符类型。

## 结构体和函数

结构体用 `struct` 定义，用 `.` 索引内容，包括具名结构体、元组（成员匿名）和单元结构体（没有任何成员）。具名结构体用花括号定义成员字段（单元结构体可以省略花括号）。结构体必须整个可变或整个不可变。

+ 具名结构体在初始化时，若赋值变量和待赋值的成员字段同名，可以简化赋值。
+ 可以用类似初始化的方式将具名结构体里的字段移动出来。这种方式要求该结构体未定义 drop。 
+ 把结构体里某个字段的所有权转移出去后，就无法访问该字段，但仍能正常访问其他字段。
+ 将 `..` 置于初始化的最后部分，来根据另一个实例创建新实例。
+ 用 `impl` 块来定义结构体的专属方法。一个结构体可以定义多个 `impl` 块。用 `impl` 块定义的函数被称为关联函数（*associated functions*），用 `Self` 和 `self` 指代关联结构体和其实例。

```rust
struct User {
    username: String,
    sign_in_count: u64,
}
let user1 = User {
    username: String::from("someusername123"),
    sign_in_count: 1,
};
let user2 = User {
    sign_in_count: 2,
    ..user1
};
let User {sign_in_count, ..} = user2;
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
    fn square(size: u32) -> Rectangle {
        Rectangle {
            width: size,
            height: size,
        }
    }
}
```

函数（*function*）用关键词 `fn` 声明，函数体是个块表达式。函数每个输入参数和返回值都要声明类型，若不声明则默认返回 `()`。同一模块下的函数名称不能相同（即使参数不同）。

方法（*method*）是以 `self`（包括 `&self`，`mut self` 等） 作为第一个参数的关联函数。结构体实例调用结构体方法时，会根据方法的定义进行自动引用和解引用（*automatic referencing and dereferencing*）。

常量函数（*constant function*）用 `const fn` 标识，定义在常量上下文（*const context*）中，编译阶段就能执行：

1. 常量函数计算出的结果必须是无副作用且确定性的，即不能使用随机数生成器、系统时间、文件 IO 等。
2. 常量函数里暂时不支持浮点数运算。执行循环有步数上限，最初支持 loop/while，Rust 1.62 开始支持 for。

函数、结构体和结构体方法都支持泛型，编译时进行单态化（*monomorphization*），不影响运行效率。

```rust
struct Point<T, U> {
    x: T,
    y: U,
}
impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}
```

## 枚举类型

枚举类型用 `enum` 定义，每个成员可以选择绑定一个数据类型。可以像结构体一样用 `impl` 定义方法。

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
impl Message {
    fn call(&self) {
        ...
    }
}
let m = Message::Write(String::from("hello"));
m.call();
```

枚举的每一个成员都有自己的判别式（*discriminant*）。

1. 如果枚举类型的每个成员都没有绑定数据类型，可以通过 `Enum::Foo as isize` 获取判别式的数值。
2. 标准库提供了 `std::mem::discriminant()` 方法来获取判别式的抽象值，其只能进行相等比较和哈希。

用 `repr(T)` 指定判别式在存储时实际的整型。当显式指定 `repr` 或每个成员都没有绑定数据类型时：成员的判别式数值可以手动指定，未指定的字段标号默认是前一位标号+1（第一个是 0）。

```rust
#[repr(i16)]
enum Enum {
    Foo = 3,
    Bar,
    L = -1,
}
```

整个枚举类型的占用空间一般是 `size(T) + max(size(field))`。如果没有显式指定判别式的存储类型，Rust 编译器可能使用更小的类型或方法来实现判别式（但保证能正常转为 `isize`）。例如：

1. `Enum{A, B}` 默认使用一个字节，而 `Option<T>` 只需要 `size(T)`。
2. `Trick<T>` 只需要等同于 usize 的空间（用 0 表示 Foo，其他值表示堆上 Box 的地址）。

```rust
// the size is same as usize
enum Trick<T> {
    Foo,
    Bar(Box<T>),
}
```

## Vec 和 String

`Vec<T>` 是可变长数组，数据存储在堆上，栈上会保留 pointer, capacity 和 length 三个参数。

+ 下标索引元素时：如果 `T` 没有实现 copy trait，所有权会移动；越界时会报 panic 错误。
+ 用 `.get()` 索引，可以得到 `Option<&T>` 类型。

注意获得某个下标引用的同时禁止对 vector 进行 push，因为 push 要获取整个 vector 的可变引用。

可以用 `Vec::new()` 新建或 `vec![]` 宏初始化构造，根据下一次使用进行类型推理。

```rust
let v = Vec::<i32>::new();
let mut v = vec![1, 2, 3];
let mut v = vec![0; 5];
v.push(4);
let mut w = Vec::with_capacity(5);
w.resize(5, 0);
```

可以用 `for...in...` 简化对 vector 的遍历，包括不可变引用遍历和可变引用遍历。

```rust
let v = vec![100, 32, 57];
for i in &v {
    println!("{}", i);
}
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50;
}
```

可以用枚举类型来变相让 vector 支持不同类型。

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}
let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
];
```

**字符串**（*string*）由 UTF-8 编码，本质上是 `Vec<u8> ` 的封装，数据保存在堆里。因为每个元素占用的字节数可能不同，字符串 **不支持下标索引** 以防止歧义发生。字符串和字符（Unicode）互转时会有性能开销。

+ 用 `.chars()` 返回字符串的实际字符集合；用 `.chars().count()` 统计实际字符个数，复杂度线性。
+ 用 `.bytes()` 返回每一个原始字节信息；用 `.len()` 返回实际字节数，复杂度 $O(1)$。

```rust
let mut s1 = String::from("hello");
s1.push_str(", world!");           // push_str 的参数是 slice，即不获取其所有权
s1.push('2');                      // push 的参数是单个字符
let end_char = s1.pop();           // 删除最后一个字符并返回
s1.remove(0);                      // 删除指定位置的字符，索引必须是该字符开头
let mut s2 = s1 + "233";           // '+' 会调用 add，会抢走左边变量的所有权
let s3 = format!("{}{}", s2, s3);
let s4 = String::from_utf8(vec![65, 66, 67, 68]);
```

**字符串切片**（*str*）是最原始的字符串类型，能保证内部是有效的 UTF-8 编码。

字符串切片通常以借用的方式（&str）存在。&str 和数组切片一样，是一个包含地址、长度两个量的胖指针。

&str 可以源于对字符串执行切片操作。注意长度按原始字节来处理，切断 utf-8 编码后会 panic。 

```rust
let s = "Hello, World!";
assert!(s.contains("nana"));
let v: Vec<&str> = hello.split(' ').collect();

let a: &str = "hello\n";       // 自动转义处理。
let b: &str = r"hello\world";  // 原始字面量，不处理转义。
let c: &str = r#"hello"o"#;    // 包含双引号的原始字面量，用 #" 和 "# 标识头尾。
let string = String::from("xxx");
let d: &str = &string[0..5];
```

同时接受 `&str` 和 `String` 的函数签名可以写成：

```rust
pub fn parse<S>(s: S) where S: AsRef<str>            // 都视为 &str
pub fn parse<S>(s: S) -> Self where S: Into<String>  // 都转成 String
```

[Vec, [u8], String, str 的相互转化](https://gist.github.com/jimmychu0807/9a89355e642afad0d2aeda52e6ad2424)：

```rust
use std::str;
fn main() {
  // -- FROM: vec of chars --
  let src1: Vec<char> = vec!['j','{','"','i','m','m','y','"','}'];
  // to String
  let string1: String = src1.iter().collect::<String>();
  // to str
  let str1: &str = &src1.iter().collect::<String>();
  // to vec of byte
  let byte1: Vec<u8> = src1.iter().map(|c| *c as u8).collect::<Vec<_>>();

  // -- FROM: vec of bytes --
  // b - byte, r - raw string, br - byte of raw string
  let src2: Vec<u8> = br#"e{"ddie"}"#.to_vec();
  // to String
  // from_utf8 consume the vector of bytes
  let string2: String = String::from_utf8(src2.clone()).unwrap();
  // to str
  let str2: &str = str::from_utf8(&src2).unwrap();
  // to vec of chars
  let char2: Vec<char> = src2.iter().map(|b| *b as char).collect::<Vec<_>>();

  // -- FROM: String --
  let src3: String = String::from(r#"o{"livia"}"#);
  let str3: &str = &src3;
  let char3: Vec<char> = src3.chars().collect::<Vec<_>>();
  let byte3: Vec<u8> = src3.as_bytes().to_vec();

  // -- FROM: str --
  let src4: &str = r#"g{'race'}"#;
  let string4 = String::from(src4);
  let char4: Vec<char> = src4.chars().collect();
  let byte4: Vec<u8> = src4.as_bytes().to_vec();
}
```

动态大小类型（*dynamically sized types*，DST）允许我们处理只有在运行时才知道大小的类型。Rust 不允许直接创建 DST 的变量，也不能直接获取 DST 的参数。`str` 和 `[T]` 是典型的 DST，我们常用引用的形式使用它（记录地址和长度，所以 `&str` 的大小是 `usize` 大小的两倍），或者用 `Box<str>` 或 `Rc<str>` 等指针使用它。

为了处理 DST，Rust 有一个特定的 trait `Sized` 来确定一个类型的大小是否在编译时可知。而且 Rust 隐式地为每一个泛型函数增加了 `Sized` bound。只有当 `T` 使用了 `T: ?Sized` 时才表明 `T` 的大小可能在编译时无法确定。

## 标准库常用容器

Rust 标准库的 `std::collections` 模块提供了丰富的集合类型，按用途可分为四类 ：

| 分类     | 容器             | 底层实现               | 核心特性                                 |
| -------- | ---------------- | ---------------------- | ---------------------------------------- |
| **序列** | `Vec<T>`         | 动态数组（堆分配）     | 随机访问 $O(1)$，尾部增删均摊 $O(1)$     |
|          | `VecDeque<T>`    | 环形缓冲区             | 双端均摊 $O(1)$ 增删，不支持索引         |
|          | `LinkedList<T>`  | 双向链表               | 任意位置 $O(1)$ 增删（已知迭代器）       |
| **映射** | `HashMap<K, V>`  | 开放寻址哈希表         | 平均 $O(1)$ 查找，键无序                 |
|          | `BTreeMap<K, V>` | B-Tree 多路搜索树      | $O(\log ⁡n)$ 查找，键有序，支持范围查询   |
| **集合** | `HashSet<T>`     | `HashMap<T, ()>` 封装  | 唯一元素，成员测试 $O(1)$                |
|          | `BTreeSet<T>`    | `BTreeMap<T, ()>` 封装 | 唯一有序元素，支持集合运算               |
| **其他** | `BinaryHeap<T>`  | 最大堆                 | $O(1)$ 获取最大值，$O(\log⁡ n)$ 插入/弹出 |

`std::collections::HashMap` 默认使用 SipHash-1-3 算法，在抗哈希碰撞攻击（DoS）和性能间取得平衡；若追求极致性能且键可控，可用 `ahash::RandomState` 替换默认的 SipHash。

HashMap 的键和值的类型必须各自相同。

+ `.insert(key, value)`：插入一组元素，若存在则会覆盖。
+ `.entry(key).or_insert(value)`：如果 key 不存在，就插入指定 value。返回 value 的可变索引。

对于基本类型这种实现了 `copy trait` 的类型，其值会直接拷贝至 map，否则会转移所有权至 map。

```rust
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
let teams  = vec![String::from("Blue"), String::from("Yellow")];
let initial_scores = vec![10, 50];
let scores: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();
let score = scores.get(&team_name);
for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

## 模式匹配

Match 是模式匹配的经典案例，允许将一个值与一系列模式进行比较，并执行对应的流程。

+ 每一种模式的处理结果的返回值必须相同。允许某个分支里使用 `continue/return/panic!` ，其返回类型会被标注成 `!`，然后被强制转化成需要的类型。
+ 模式之间范围可以重叠（优先取第一个），但必须穷尽所有情况。可使用 `<name>/_` 表示其他情况。
+ 由于编译时要确定每个模式是否非空，当模式使用序列时仅支持表达式是数值或字符类型。
+ 用 `|` 表示并列；用 `@` 将模式内容绑定到变量上供分支流程里使用，如 `n @ 1..=12` 和 `Some(n @ 42)`。
+ 值的表达式可以表示结构体，用花括号取其中的若干字段，用 `..` 表示忽略剩余字段。
+ **匹配守卫**（*match guard*）应用于某个分支后，只有当额外的 `if` 条件成立才会执行对应语句。当同一句模式里匹配守卫和 | 结合时，| 前后所有的可能都会执行 if 条件。

`if let` 是 Match 的语法糖（没有定义 PartialEq 的 enum 也能使用），可选的 `else` 相当于 Match 里的 `_`。

```rust
let mut count = 0;
if let Coin::Quarter(state) = coin {
    println!("State quarter from {:?}!", state);
} else {
    count += 1;
}
```

Rust 1.65 支持了 `let else` 语法，同时在 `match` 分支中支持使用 `if let` 守卫：

```rust
fn get_count_item(s: &str) -> &str {
    let mut it = s.split(' ');
    let (Some(count_str), Some(item)) = (it.next(), it.next()) else {
        panic!("Can't segment count item pair: '{s}'");
    };
    item
}

match value {
    Some(x) if let Ok(y) = compute(x) => { /* use x and y */ }
    _ => {}
}
```

Rust 1.88 + Edition 2024 支持了链式的 `if let`，即 `if let A(x) = y && let B(z) = w`。

`let`，`while let` 和 `for` 中也可以使用模式匹配来简化代码。

```rust
struct Foo {
    x: (u32, u32),
    y: u32,
}
let foo = ...
for Point {(a, b), c} in foo {
    ...
}
let Foo {
    x: (a, b),
    y: rename_y
} = foo;
```

模式的可反驳性（*refutability*）：**不可反驳的** 指能匹配任何传递的值，**可反驳的** 指会存在匹配失败。

+ 函数参数，`let` 和 `for` 只能接受不可反驳的模式，因为不匹配时是无意义的。
+ `if let`、`while let` 和 `let else` 被设计成只能接受可反驳的模式。
+ `match` 中最多只能有一个分支使用不可反驳模式。

切片模式可以匹配固定大小的数组和动态大小的数组切片。

+ 匹配数组时，只要每个元素都是不可反驳的，切片模式就是不可反驳的。
+ 匹配数组切片时，只有当模式是有标识符和后置的 `..` 构成时，才是不可反驳的。

```rust
let v = vec![1, 2, 3];
match v[..] {
	[a, b] => (),
	[a, b, c] => (),
	_ => (),
}
```

切片模式内部如果用范围模式表达某个元素：

+ 和 Match 一样，当前 Rust 稳定版不允许使用 inclusive 的范围模式。
+ 没有上下界的必须用括号括起来，如 `(a..)`；具有上下界的范围模式则无须括号，如 `a..=b`。

## Option 和 Result

Option 和 Result 是 Rust 内置的泛型枚举类型。

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
enum Option<T> {
    Some(T),
    None,
}
```

用 `Result<T, E>` 处理可恢复的错误。

+ `.unwrap()` 可以解包 `Result` 直接获得其返回值，若产生 Error 会转化成 panic。
+ `.expect()` 与上述类似，只是会把 panic 错误信息替换成给出的字符串参数。

```rust
use std::fs::File;
use std::io::ErrorKind;
fn main() {
    let f = File::open("hello.txt");
    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {:?}", e),
            },
            other_error => panic!("Problem opening the file: {:?}", other_error),
        },
    };
}
```

调用函数的末尾加上 `?` 后可以简单地起到错误传播的作用。即若 Result 返回值是 Ok，? 不起任何作用；若返回值是 Err，会把值做一个 `into()`  强制转换并向外传递。`?` 本质上是所有实现了 `try trait` 的类型的语法糖。最常见的实现了 `try trait` 的类型是 `Result<Ok, Err>`，`Option<T>` 和 `ControlFlow<B, C>`。

```rust
fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("hello.txt")?.read_to_string(&mut s)?;
    Ok(s)
}
```

当开发者遇到不可处理的错误时，Rust 会产生 panic，此时有两种处理方式可选。

+ 栈展开（*unwind*），默认的处理方式。Rust 会回溯栈上的数据和函数调用，终止出错所在线程，并调用析构函数。栈展开可以设置 RUST_BACKTRACE 环境变量来得到 backtrace。在没有使用 unsafe 代码的情况下，栈展开能保证 panic 时不会导致内存不安全。`panic::catch_unwind` 用于捕捉栈展开方式下的 panic，但要求传递过来的闭包必须是 UnwindSafe 的。若无标记，可以用 AssertUnWindSafe 这个包装器强制转换。
+ 终止（*abort*）。程序会不清理数据直接退出，由操作系统来清理。可在配置项里配置 `panic = 'abort'`。

用 `Option<T>` 表达可能为空的数据，它和 Result 一样可以在函数里里用 `?`  抛出。

如果要用到 `Option<T>` 的引用，一般来说 [`Option<&T>` 比 `&Option<T>` 更好](https://www.youtube.com/watch?v=6c7pZYP_iIE)。

+ 若返回值里返回 Option 可变引用，`Option<&mut T>`  和 `&mut Option<T>` 语义不同，酌情选取。
+ 若返回值里返回 Option 不可变引用，前者更优。
  + `Option<&T>` 操作更灵活，可直接调用 `map`/`and_then` 等组合子。
  + `Option<&T>` 经过 Niche 优化后空间占用和 `&T` 相同：全零地址表示 None，非全零地址指向 `T` 地址。
  + `Option<&T>` 兼容性也更好，例如从 `T` 改为 `Box<T>` 时函数签名不用发生变化。

+ 若参数里传入 Option 的可变引用，也是前者更优，因为后者在构造时会移动 T。

黑科技：`If let Some(a) = b` 可以写成 `for a in b`（但是不推荐）。

Option 和 Result 之间可以灵活转化，Rust 提供了很多类似流操作的 API。

## 所有权和生命周期

Rust 中的每一个值都有一个对应的所有者（*owner*）的变量。当变量离开其作用域时，值会被丢弃。

+ 对未实现 copy trait 的类型进行赋值或函数传参时所有权会转移（*move*），原变量不能再被使用。
+ 对于结构体或元组等编译期间可以确定的复合类型，允许部分成员发生所有权的转移，其他成员仍然可以正常使用，但结构体整体不允许再被使用；而数组、Vec 不允许部分成员转移，因为编译器无法准确统计。

Rust 用 `&` 表示引用（*borrow*），不发生所有者的转移；用 `&mut` 表示可变引用，可以改变值但是不发生所有者的转移。借用检查规定：一个值在同一个作用域内只能有一个可变引用或多个不可变引用。

Rust2018 引入非词法作用域生命周期（[*Non-Lexical Lifetimes*](https://rust-lang.github.io/rfcs/2094-nll.html)，NLL）特性。如果某个引用在以后的代码中不再被使用，它会在最后一句相关的语句执行之后提前被消除。即以下代码能正确运行。

```rust
let mut s = String::from("hello");
let r1 = &s;
let r2 = &s; 
println!("{} and {}", r1, r2);
let r3 = &mut s;
println!("{}", r3);
```

数组元素的借用会使整体被标记成借用。为了对多个元素进行可变操作，有以下几种解决方案：

+ 使用循环或其他迭代结构，这样可以在不同迭代步骤的作用域中分别可变借用不同的元素。
+ 使用切片的 `split_at_mut` 方法，可以获得指向数组不同部分的两个可变切片。
+ 使用 `Cell` 或 `RefCell` 这种提供内部可变性的类型，但会造成一些运行时的开销。

生命周期（*lifetime*）用于表示多个引用的泛型生命周期参数如何相互联系。生命周期参数本质用泛型来标注，参数以 `'` 开头，通常是较短的小写字母（如 `'a`）。返回值引用和某个参数引用如果有相同的标记，意味着其生命周期不得短于该参数。注意使用泛型参数时，生命周期参数始终在类型参数之前。

下面的例子暗示了 `longest` 返回的引用的生命周期与传入两个引用的较小者保持一致。

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

结构体的每个引用也要标注。下例暗示 `ImportantExcerpt`  实例不能比其 `part` 字段引用的字符串存在得更久。

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}
fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt { part: first_sentence };
}
```

结构体方法里的引用也要标注。下例展示了两组（执行生命周期省略规则后）合法的方法标注示例。

```rust
impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

早期 Rust 要求每个引用都标注明确的生命周期，后来编译器会执行生命周期省略规则（*lifetime elision rules*）。Rust 有一条输入生命周期（*input lifetimes*）省略规则和两条输出生命周期（*output lifetimes*）省略规则。它会根据这三条规则对当前代码进行不完整推断，如果推断完后仍然残留未知生命周期的参数就会编译报错。

1. 默认每一个是引用的参数都有它自己默认的生命周期参数。
2. 如果输入生命周期参数只有一种，那么它会被赋予给所有输出生命周期参数。
3. 如果方法有多个输入生命周期参数且其中一个参数是 `&self` 或 `&mut self`（说明是对象的方法），那么所有输出生命周期参数会被赋予 `self` 的生命周期。

根据 RFC 599 和 RFC1156，Trait 的默认生命周期会被加上 `'static`，显式加上 `'_` 才能用于常规的省略规则。

静态生命周期用 `'static` 标注，其生命周期能够存活于整个程序期间。字符串字面量默认是静态生命周期。

```rust
let s: &'static str = "I have a static lifetime.";
```

## Trait

trait 类似于其他语言的接口（*interfaces*），用来定义一系列函数的集合。任何类型都可以是 trait 的实例。

定义 trait 时可为函数实现默认方法。注意，无法从相同方法的重载实现中调用默认方法。

```rust
pub trait Summary {
    fn summarize_author(&self) -> String;
    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}
impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
```

使用泛型时，可以用 `:` 指定要求实现的 trait，称为泛型约束（*trait bound*）。多个 trait 之间用 `+` 连接。函数参数中可以用 `impl` 简化声明，也可以用 `where` 语法把参数里的泛型约束更清晰地提取出来。

```rust
pub fn notify(item1: impl Summary, item2: impl Summary)
pub fn notify<T: Summary， U: Summary>(item1: T, item2: U)

fn some_function<T: Display + Clone, U: Clone + Debug>(t: T, u: U) -> i32
fn some_function<T, U>(t: T, u: U) -> i32
    where T: Display + Clone, U: Clone + Debug

struct Pair<T> {
    x: T,
    y: T,
}
impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        println!("x = {}, y = {}", self.x, self.y);
    }
}
```

trait 没有继承功能，但可以要求作为若干个 trait 的超集，用 `:` 和 `+` 连接，例如 `trait Sub: Supertrait1 + Supertrait2`，那么实现 `Sub` 时必须同时实现前两个 trait。

当和 trait 的方法出现歧义时，可以用完全限定语法（*fully qualified syntax*）指定。 如果结构体 Human 定义了 `fly(&self)` 方法，它又实现了带有 `fly(&self)` 方法的 Pilot trait，`h.fly()` 默认使用前者， `Pilot::fly(h)` 指定使用后者；如果 `fly()` 方法里不带有 `&self`，用 `<Pilot as Human>::fly()`  指定使用后者。

上述的 trait 泛型属于静态分发，当我们希望使用一个 trait 的实例而不确定到底是哪种类型时（例如用 Vec 装不同实例），需要用 dyn trait 来实现动态分发（*dynamic dispatch*）。dyn trait 在内存里会被表示成占用两个机器字长的胖指针（*fat pointer*），常用 `&dyn trait` 或 `Box<dyn trait>` 索引。

+ 数据指针：指向具体实例在堆或栈上的内存地址。
+ 虚表指针（*vtable pointer*）：该 trait 所有方法的实际执行地址，需要在编译期就完全固定好。

一个 Trait 的方法如果想安全地实现动态分发，需要满足如下的对象安全（*Object Safety*）性质：

+ 方法里不能带有泛型参数。编译期无法预知运行时传入什么类型，导致虚表的大小不确定。
+ 方法里除了第一个 self 外，其他参数/返回值的类型不能是 Self。这样可能会引入两个内存布局不同的实例。
+ 如果使用关联类型，必须在 dyn 中明确指定具体类型。为了在编译器得知关联类型，预设对应的内存。
+ 方法必须包含某种形式的 `self` 接收者（不能是静态函数）。没有 `self` 参数就没法得到虚表。

一个 trait 是对象安全的，当且仅当其所有方法都是对象安全的，且其所有 super trait 都是对象安全的。

+ 如果 dyn trait 用于非对象安全的 trait，会触发 rust 编译器的报错。
+ 可以用 `where Self: Sized` 来将未满足对象安全条件的函数排除在外（dyn trait 时就无法调用）。

```rust
trait Animal {
    fn noise(&self) -> &'static str;
    fn foo(x: i32) where Self: Sized;
}
fn animal_speak(animal: &dyn Animal) -> &'static str {
    animal.noise()
}
```

Rust **不允许为外部类型实现外部 trait**，即只有当 trait **或者** 要实现 trait 的类型位于 crate 的本地作用域时，才能为该类型实现 trait。这个限制被称为孤儿规则（*orphan rule*），主要有两个目的：防止 crate 间的 trait 互相冲突；实现向前兼容，即不会因为依赖 crate 中 trait 实现的变化造成无法编译。

一个绕开孤儿规则的方法是使用 newtype 模式，对待实现 trait 的类型做一个简单的封装。如下：

```rust
use std::fmt;
struct Wrapper(Vec<String>);
impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}
```

| 常见 trait   | 效果                                                         |
| ------------ | ------------------------------------------------------------ |
| Add/Sub/...  | 通过实现对 std::ops 里的运算符 trait，可以实现运算符的重载。 |
| Clone        | 标记结构体是否能被整个复制。                                 |
| Copy         | Clone 的子 trait。标记性质，表示类型可以按位复制，和 Drop trait 不能一起实现。已实现的类型包括：整型，布尔型，浮点型，字符型，成员已实现的元组或数组，不可变引用。 |
| Display      | 定义当前类型如何支持 Formatter 来打印。实现了 Display 会自动实现 ToString。 |
| Drop         | 定义方法 `drop()`，在对象离开作用域时自动调用。析构是有顺序的。 |
| Deref        | 重载解引用运算符，使得调用 `*mb` 等价于调用 `*(mb.deref())`。 |
| `Into<T>`    | 定义当前类型如何转化成类型 T。                               |
| `From<T>`    | 定义当前类型如何从类型 T 转化而来。实现了 From 会自动实现 Into。 |
| `TryInto<T>` | 定义当前类型如何转化成类型 T，返回结果是 Result。            |
| `TryFrom<T>` | 定义当前类型如何从类型 T 转化而来，返回结果是 Result。       |
| `FromStr<T>` | 定义如何从 str 类型转化成当前类型，实现后通过 `.parse()` 触发。 |
| Eq           | PartialEq 超集，比较同类型的实例，要求满足自反性、对称性和传递性。 |
| Ord          | PartialOrd 和 Eq 超集，比较同类型的实例，要求比较顺序确定（浮点数未实现 Ord） |
| PartialEq    | 比较类型 A 的实例 a 是否和类型 B 的实例 b 是否相同。         |
| PartialOrd   | PartialEq 超集，比较类型 A 的实例 a 和类型 B 的实例 b 的大小关系。 |
| Send   | 标记该类型能安全地发送至另一个线程。 |
| Sized        | 表示实例占用的空间大小在编译时确定。函数参数要求必须是 Sized。无长度的参数数组、不含 Sized 约束的 dyn  trait 和含有 ?Sized 约束的结构体泛型参数被认为是 Unsized 的。 |
| Sync   | 标记该类型能够安全地在线程之间共享 |
| ToString     | 定义当前类型如何转化成 String 类型，常通过特化 `fmt::Display` 实现，实现后通过调用 `.to_string()` 触发。 |
|Unpin|表示类型能够安全地在内存中移动。|
| UnwindSafe   | 标记发生 panic 时的类型是否仍然安全。                        |

## 关联类型 Associated Types

泛型是把类型作为**参数**传给 Trait；而关联类型（associated types）则是把类型作为**属性**声明在 Trait 内部。

想象要实现一个抽象的发动机系统，适配火箭发动和柴油发动（它们彼此都有专属的燃料）：

```rust
trait Engine<Fuel> {
    fn start(&mut self, fuel: Fuel);
}

struct RocketEngine; // 火箭发动机
struct DieselEngine; // 柴油发动机

struct RocketFuel;   // 火箭燃料
struct DieselFuel;   // 柴油

impl Engine<RocketFuel> for RocketEngine {
    fn start(&mut self, fuel: RocketFuel) { /* ... */ }
}

// 荒谬但被编译器允许的实现：允许火箭发动机去实现“烧柴油”
impl Engine<DieselFuel> for RocketEngine {
    fn start(&mut self, fuel: DieselFuel) { /* ... */ }
}
```

泛型带来的技术缺陷是：

1. 允许了不合逻辑的“多重实现”。火箭发动机明明只能烧火箭燃料，但因为泛型允许 `Engine<T>` 有无限可能。
2. 泛型污染与类型二义性.如果你写一个启动发动机的通用函数，你被迫要把燃料类型也作为泛型一路传上去。

```rust
trait Engine {
    type Fuel; // 关联类型：在 Trait 内部声明一个“类型的占位符”
    fn start(&mut self, fuel: Self::Fuel); // 使用 Self::Fuel 来代表那个唯一的燃料
}
```

### 用关联类型实现迭代器 Iterator

若迭代器 `Iterator` 用泛型定义出多种类型的实现，每次调用 `next()` 的时候必须写全约束（如 `Iterator::<u32>::next()`），否则编译器会面临二义性。故 `Iterator` 使用关联类型来实现 ：

```rust
pub trait Iterator {
    type Item; // 强绑定：一个迭代器只能产出一种确定类型
    fn next(&mut self) -> Option<Self::Item>;
}
```

`Iterator` 的方法主要分为适配器（adapters）和消费者（consumers）两种。

+ 适配器：定义新的包装结构并在其上实现 Iterator 的 `next()` 方法，如 `map/filter/zip/take/skip`。
+ 消费者：直接在 Iterator 里定义方法，循环调用 `next()` 计算结果，如 `fold/sum/count/collect`。

```rust
pub struct Filter<I, P> {
    iter: I,
    predicate: P,
}
impl<I: Iterator, P: FnMut(&I::Item) -> bool> Iterator for Filter<I, P> {
    type Item = I::Item; 
    fn next(&mut self) -> Option<Self::Item> {
        while let Some(item) = self.iter.next() {
            if (self.predicate)(&item) {
                return Some(item);
            }
        }
        None
    }
}

trait Iterator {
    type Item;
    fn fold<B, F>(mut self, init: B, mut f: F) -> B
    where
        F: FnMut(B, Self::Item) -> B,
    {
        let mut accum = init;
        while let Some(x) = self.next() {
            accum = f(accum, x);
        }
        accum
    }
}
```

实际使用时也很方便：

```rust
let v1: Vec<i32> = vec![1, 2, 3];
let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();
let sum: u32 = Counter::new()
	.zip(Counter::new().skip(1))
	.map(|(a, b)| a * b)
	.filter(|x| x % 3 == 0)
	.sum();
}
```

### 用关联类型实现 Deref

编译器只会解引用 & 引用类型，故引入 Deref trait 提供其他解引用场景的功能。实现 `deref` Trait 时使用关联类型而非泛型，用来保证解引用的实现是唯一的。

```rust
pub trait Deref {
    type Target: ?Sized;
    fn deref(&self) -> &Self::Target;
}

impl Deref for String {
    type Target = str; 
    fn deref(&self) -> &Self::Target { ... }
}
```

Rust 支持以下三种解引用的强制转换（*deref coercions*）。

+ 当 `T: Deref<Target=U>` 时从 `&T` 到 `&U`，如 `&String` 能够强转为 `&str`。
+ 当 `T: DerefMut<Target=U>` 时从 `&mut T` 到 `&mut U`。
+ 当 `T: Deref<Target=U>` 时从 `&mut T` 到 `&U`。

### 泛型关联类型

Rust 1.65 支持在关联类型定义中声明泛型参数，被称为泛型关联类型（*Generic Associated Types*, GATs）。

```rust
trait MyTrait {
    type Assoc<T>; // 关联类型自己带了泛型参数 T
    type Streaming<'a>; // 关联类型自己带了生命周期参数 'a
}
```

如果要设计一个流式迭代器，每次 `next()` 产出迭代器内部指向的缓冲区位置，不借助 GAT 的能力无法做到：

```rust
trait StreamingIterator {
    type Item; // 普通关联类型
    // 我们希望返回一个带有生命周期的引用，'a 必须和 &mut self 绑定
    // 但普通关联类型 Item 无法引用这个在函数调用时才产生的临时生命周期 'a，编译不通过
    fn next<'a>(&'a mut self) -> Option<Self::Item>; 
}

trait StreamingIterator<'a> {
    type Item;
    // 强行绑定 &mut self 的生命周期为 'a，使用一次 next() 后迭代器就被所在 'a 了。
    fn next(&'a mut self) -> Option<Self::Item>;
}
```

在关联类型上标注生命周期即可解决上述问题。

```rust
trait StreamingIterator {
    // 关键：关联类型现在是一个“类型构造器”，它接收一个生命周期参数 'a
    type Item<'a>; 
    fn next<'a>(&'a mut self) -> Option<Self::Item<'a>>;
}

struct FileReader {
    buffer: String,
}
impl StreamingIterator for FileReader {
    type Item<'a> = &'a str; 

    // 每次调用 next，返回的引用的生命周期，都精准地和当时的 &mut self 绑定
    fn next<'a>(&'a mut self) -> Option<Self::Item<'a>> {
        if self.buffer.is_empty() {
            None
        } else {
            Some(&self.buffer[..])
        }
    }
}
```

## 闭包

所谓闭包，就是能够捕获作用域里变量的匿名函数。

定义闭包时，`||` 里定义参数列表，后接 `{}` 定义函数体。函数参数和返回值的类型可以省略，根据第一次使用的情况自动推理。闭包和函数最大的不同是它可以自动捕捉作用域里的变量。

```rust
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

编译器倾向于优先通过不可变借用来捕获外部变量，其次是可变借用，最后才是移动所有权。

在闭包参数前加上 `move` 关键词后，闭包会强制获取作用域里所需变量的所有权（copy trait 仍然是拷贝），一般用于跨线程数据传输。这种闭包在调用一次之后无法再次捕获作用域里的变量，所以只能被 `FnOnce()` 接受。

+ 当 move 闭包使用了数组元素，且数组元素不支持 copy trait：获取了整个数组的所有权。
+ 当 move 闭包使用了结构体、元组、枚举的字段，且该字段不支持 copy  trait：如果该结构体未实现 drop trait，则捕获的是单个字段的所有权，否则是整个结构体的所有权。

闭包作为函数参数时，可以用三种 trait 承接：

| trait 名           | 原理                                                         |
| ------------------ | ------------------------------------------------------------ |
| `FnOnce(self)`     | 只能调用一次。所有闭包都会实现 `FnOnce` trait。              |
| `FnMut(&mut self)` | 可多次调用。获取作用域里变量的可变引用，生存期间外界无法获取引用 |
| `Fn(&self)`        | 可多次调用。获取作用域里变量的不可变引用，生存期间外界无法获取可变引用 |

普通函数的 `fn` 无须捕获作用域里的变量，因此可以随时随地调用。函数指针可将函数作为参数，其同时实现了闭包的三个 trait。不捕获环境中的任何变量的闭包可以通过匹配签名的方式自动转化成函数指针。

```rust
fn main() {
    fn do_twice(f: fn(i32) -> i32, arg: i32) -> i32 {
        f(arg) + f(arg)
    }
    let add = |x: i32| x + 1;
    let answer = do_twice(add, 5);
}
```

闭包返回引用类型的参数时，需要显式指定生命周期。

## 智能指针

智能指针通常用结构体实现，通过实现 Deref trait 和 Drop trait 来做到自动引用和清理。

Rust 不允许自发调用 `Drop::drop` 方法，只能通过 `std::mem::drop(x)` 显式释放资源。析构顺序如下：

+ 作用域里的变量按定义的逆序析构，函数参数同样按定义的逆序析构。
+ 嵌套的作用域按深度优先的顺序（*inside-out order*）析构。
+ 结构体、枚举的字段按代码中声明的顺序析构，元组和数组按元素的先后顺序析构。
+ 注意闭包通过移动捕获的变量的析构顺序目前是未定义的。

最简单的智能指针是 `Box<T>`，实际数据会被转移到堆上存储，栈上仅保留指针。内存布局取决于 T 本身：如果是 T 是 Sized 栈上就只需记录地址，如果是 Slice 栈上还需记录长度，如果是 dyn trait 栈上还需记录虚表指针。

Box 可以解决递归类型的问题（Rust 不允许直接递归定义结构体，因为这样就无法计算所需空间）。

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}
fn main() {
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
}
```
`Box<T>` 通过实现 Deref trait，使得 `&Box<T>` 可以自动转换为 `&T`：

```rust
impl<T> Deref for MyBox<T> {
    type Target = T;
    fn deref(&self) -> &T {
        &self.0
    }
}
```

注意 Rust 编译器内置了针对 Box 的特殊逻辑。`*box` 在赋值/传参场景能够转移 Box 内部的值，具体为：

|          操作           |      行为       | 是否转移所有权 |           原理            |
| :---------------------: | :-------------: | :------------: | :-----------------------: |
|    `&*box` / `&box`     | 解引用产生 `&T` |      ❌ 否      |  `Deref::deref` 返回引用  |
| `*box`（赋值/传参场景） | 移动堆上值到栈  |      ✅ 是      | 编译器对 `Box` 的特殊处理 |
|    `*my_custom_box`     |   仅产生 `&T`   |      ❌ 否      |     普通类型无此优化      |

`Rc<T>` 是引用计数指针，支持多所有权机制。用 `Rc::clone` 克隆时计数器会加一，离开作用域计数器就减一，当计数值为 0 时数据会被清理。 注意 `Rc<T>` 仅支持多个所有者 **只读地** 共享数据，否则会违反所有权规则。

`Rc<T>` 可能会引起引用循环导致内存泄漏，因为只有当 `strong_count=0` 才会清理。可以调用 `Rc::downgrade` 创建 `Weak<T>` 。弱引用也会进行计数，区别在于 `weak_count` 无须计数为 0 就能使 `Rc<T>` 实例被清理。

`Cow` 智能指针包含 Borrowed 和 Owned 两种类型，前者是对原始数据的引用，后者拥有所有权。

```rust
pub enum Cow<'a, B>
where
    B: 'a + ToOwned + ?Sized,
 {
    Borrowed(&'a B),
    Owned(<B as ToOwned>::Owned),
}
```

Cow 支持 clone-on-write 功能，在需要 Clone 时才进行 Clone。下面是官网的例子：

```rust
fn abs_all(input: &mut Cow<[i32]>) {
    for i in 0..input.len() {
        let v = input[i];
        if v < 0 {
            input.to_mut()[i] = -v;
        }
    }
}

// No clone occurs because `input` doesn't need to be mutated.
let slice = [0, 1, 2];
let mut input = Cow::from(&slice[..]);
abs_all(&mut input);

// Clone occurs because `input` needs to be mutated.
let slice = [-1, 0, 1];
let mut input = Cow::from(&slice[..]);
abs_all(&mut input);

// No clone occurs because `input` is already owned.
let mut input = Cow::from(vec![-1, 0, 1]);
abs_all(&mut input);
```

一个经典的例子是 `B = str`。这个 enum 结构体在早期 Rust 里占用 $32$ 字节，包括 $8$ 字节的 discriminant 和 $\max(\text{Borrowed}=16,\text{Owned=}24)$ 字节的内容。Rust 1.30 引入了无效值优化（*niche optimization*），利用了 String 内部的裸指针不可能为全零的性质，把 Borrowed+discriminant 和 Owned 并列，空间降为 $24$ 字节。

```rust
enum Cow {
	Borrowed(&str),
	Owned(String),
}
```

## Unsafe 和内部可变性

内部可变性（*interior mutability*）是 Rust 的一个设计模式，需要用 `unsafe` 标记，以模糊可变性和借用规则。

`UnsafeCell<T>` 提供了一种在不可变值内部进行修改的方法。不基于其开发的内部可变性都是未定义行为。

```rust
#[repr(transparent)]
pub struct UnsafeCell<T: ?Sized> {
	value: T
}
```

`Cell<T>` 基于所有权转移提供内部可变性接口，内部直接基于 UnsafeCell 做了封装，不会导致 panic。

```rust
#[repr(transparent)]
pub struct Cell<T: ?Sized> {
	value: UnsafeCell<T>,
}

let a: Cell<u32> = Cell::new(5);    
assert_eq!(a.get(), 5);                // 返回内部数据拷贝，需要 T:Copy
let b = a.replace(10);                 // 替换 Cell 里的数据，返回旧数据
a.set(10);                             // 替换 Cell 里的数据，舍弃旧数据
let b: Cell<u32> = Cell::new(10);     
a.swap(&b);                            // 交换两个相同类型的 Cell 的数据
```

`RefCell<T>` 基于引用计数提供内部可变性接口，内部也基于 UnsafeCell 开发。

+ 它有 `borrow` 和 `borrow_mul` 两个方法，分别创建一个不可变借用和可变借用。任何时候仅能有多个不可变借用或者一个可变借用，这个检查从编译时推迟到运行时，违反会 panic。
+ 内部维护计数器：初始值为 09；不可变借用时值 +1，释放时值 -1；可变借用时值直接置为 -1。
+ 使用 `try_borrow()` 可尝试获取不可变借用，若内部计数器值为 -1 则返回 BorrowError。

结合 `Rc` 和 `RefCell` 来拥有多个可变数据所有者，即 `Rc<RefCell<T>>`。

```rust
enum List {
    Cons(Rc<RefCell<i32>>, Rc<List>),
    Nil,
}
fn main() {
    let value = Rc::new(RefCell::new(5));
    let a = Rc::new(Cons(Rc::clone(&value), Rc::new(Nil)));
    let b = Cons(Rc::new(RefCell::new(6)), Rc::clone(&a));
    let c = Cons(Rc::new(RefCell::new(10)), Rc::clone(&a));
    *value.borrow_mut() += 10;
    println!("a after = {:?}", a); // a after = Cons(RefCell { value: 15 }, Nil)
    println!("b after = {:?}", b); // b after = Cons(RefCell { value: 6 }, Cons(RefCell { value: 15 }, Nil))
    println!("c after = {:?}", c); // c after = Cons(RefCell { value: 10 }, Cons(RefCell { value: 15 }, Nil))
}
```

## 多线程编程

`RefCell` 解决了单线程下“共享不可变引用时修改数据”的需求，但在多线程语境下，`RefCell` 无法跨线程使用（核心是它没实现 `Sync`）。Rust 的多线程模型以无畏并发（*Fearless Concurrency*）为核心，借助所有权系统与类型系统在编译期拦截绝大多数数据竞争与内存安全问题。我们需要引入线程安全的共享与同步原语。

### Send 和 Sync

[`Send` 和 `Sync`](https://doc.rust-lang.org/nomicon/send-and-sync.html) 是 Rust 提供的两个标记 trait，用于在编译期刻画类型在多线程模型下的安全性。

| Trait 名 | 定义                                                   | 直观理解                     |
| -------- | ------------------------------------------------------ | ---------------------------- |
| `Send`   | 该类型的**所有权**可以安全地转移（`move`）至另一个线程 | `T` 可以塞进 `thread::spawn` |
| `Sync`   | 该类型的**共享引用** `&T` 可以安全地在多个线程间共享   | `&T` 可以被多线程同时持有    |

两者的核心关系是： `T` 是 `Sync` 的当且仅当 `&T` 是 `Send` 的。

+ 几乎所有基本类型（`i32/String/bool`）和标准容器（`Vec`/`HashMap`）都是 `Send` 和 `Sync` 的。
+ 裸指针 `*const T` 和 `*mut T` 默认不实现 `Send` 和 `Sync`（需手动 `unsafe impl`）。
+ `UnsafeCell<T>` 没有实现 `Sync`，这也导致 `Cell` 和 `RefCell` 不是  `Sync` 的。
+ `Rc<T>` 既不是 `Send` 也不是 `Sync`，它本身就被设计成单线程下的多引用，多线程下对应模型是 `Arc<T>`。

这两个 trait 能自动推导：如果一个类型的所有成员都是 `Send` 或 `Sync` 的，那么它也是  `Send` 或 `Sync` 的。如果自行给类型标注 `Send` 或 `sync`，需要在前面加上 `unsafe impl` 标记。

### Arc 和 Mutex

`Arc`（*Atomic Reference Counted*）是线程安全的引用计数指针，允许多个所有者共享同一份堆分配数据。

+ 底层机制：内部使用 `AtomicUsize` 维护引用计数，`clone()` 仅执行原子 `fetch_add`，`drop()` 执行原子 `fetch_sub`，确保计数操作的线程安全。
+ `Send` / `Sync` 约束：`Arc<T>` 自身实现 `Send + Sync`，前提是 `T: Send + Sync`。这保证了无论指针在哪个线程被克隆，内部数据都不会被破坏。
+ 性能：原子操作比普通 `Rc` 有轻微开销（尤其在高频 `clone/drop` 场景），但在多数业务逻辑中可忽略。

`Mutex`（*Mutual Exclusion*）确保同一时刻只有一个线程能获取内部数据的可变引用。

+ 锁守卫（Guard）机制：`.lock()` 返回 `Result<MutexGuard<T>, PoisonError>`。`MutexGuard` 实现了 `DerefMut`，且在离开作用域时自动释放锁（RAII 模式），避免忘记解锁导致的死锁。
+ `Send` / `Sync` 约束：`Mutex<T>` 实现 `Sync`（允许多线程持有 `&Mutex<T>` 并调用 `.lock()`），但要求 `T: Send`。因为锁释放后，数据可能被其他线程接管，内部值必须能安全跨线程转移。

+ 毒化（Poisoning）机制：若某线程在持有锁时 `panic`，`Mutex` 会被标记为“中毒”，后续 `.lock()` 调用将返回 `Err`。这是为了防止后续线程读取到不一致状态。
+ 拓展：当读操作远多于写操作时，`Mutex` 的独占特性会成为瓶颈，可使用 `RwLock<T>`（*Read-Write Lock*）。它允许多个读者并发读取，但写者独占访问。正因如此，它不仅需要 `T: Send` 还需要 `T: Sync`。

跨线程共享可变数据时，最经典的组合是 `Arc<Mutex<T>>`：

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter); // 仅增加引用计数
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap(); // 获取锁
            *num += 1; // 安全修改
            // lock guard 离开作用域，自动释放锁
        });
        handles.push(handle);
    }
    for handle in handles {
        handle.join().unwrap();
    }
    println!("最终结果: {}", *counter.lock().unwrap());
}
```

## 宏

宏（*macro*）分为 **声明宏**（*declarative macro*）和三种 **过程宏**（*procedural macro*）。

声明宏用于编写一些类 match 的表达式来生成代码，类似于 C 中的 `define`。以下是 `vec!` 简化后的声明宏。`#[macro_export]` 标注说明：只要将定义了宏的 crate 引入作用域，宏就应当是可用的。

```rust
#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

**过程宏**（*procedural macros*）更像是函数，接收 Rust 代码作为输入，操作后产生另一些代码作为输出。过程宏分为自定义派生（*derive*）、类属性和类函数三种。

举个例子，我们希望实现一个自定义 derive 宏，使得只要在结构体定义前加上 `derive(HelloMacro)` 的标记，就能为结构体自动定义一个能够打印结构体名字的 trait 方法。

+ 当用户在一个结构体前指定了 `derive(HelloMacro)` 标记后，`hello_macro_derive` 会被调用。
+ `syn::parse` 负责解析把 rust 代码解析成可操作的数据结构。若失败，会直接 panic。
+ `impl_hello_macro()` 读入可操作的数据结构，转化成新代码的 TokenStream。`quote!` 宏可以让我们编写需要返回的 Rust 代码。最后的 `into()` 方法会将其从原来的中间表示（IR）转化成 `TokenStream`。

```rust
extern crate proc_macro;
use crate::proc_macro::TokenStream;
use quote::quote;
use syn;
#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    let ast = syn::parse(input).unwrap();
    impl_hello_macro(&ast)
}
fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
    let name = &ast.ident;
    let gen = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}", stringify!(#name));
            }
        }
    };
    gen.into()
}
```

类属性宏不仅可以为属性生成代码，还可以创建新的属性。类函数宏能比声明宏更灵活地操控函数。
