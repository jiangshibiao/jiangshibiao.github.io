---
categories: Lang
cover: ../post_images/Python-Programming.jpg
date: 2023-08-23 23:13:40
description: 记录了我对 Python 的系统性学习。
tags: [Digest, Python]
title: 优雅地使用 Python
updated: 2025-09-09
---

## Numpy V.S. PyTorch

#### 初始化

```Python
na = np.array([(1, 2, 3), (4, 5, 6)])    # 元组也会变成一个维度
na = np.zeros((3, 4), order='F')         # 列优先
na = np.full((3, 5), 3.14, order='C')    # 行优先
na = np.ones((2,3,4), dtype=np.int16)
na = np.identity(4)                      # 生成大小为 4 的单位矩阵
na = np.arange(0, 3, 0.1)                # 和 range 用法类似

ta = torch.tensor([[1, 2, 3], [4, 5, 6]])
ta = torch.FloatTensor([(1, 2), (3, 4)]) # 显式指定类型
ta = torch.full((2, 3), 3.14)            
ta = torch.ones(2, 3, 4, device='cuda')  # 指定设备
ta = torch.arange(0, 3, 0.1)             # 类似 range
ta = torch.eye(4)                        # 单位矩阵
ta = torch.randn(2, 3)                   # 标准正态分布
ta = torch.empty(5, 5)                   # 未初始化内存

lst = na/ta.tolist()                     # 转为 Python 列表
nb/tb = na/ta.clone()                    # 深拷贝
```

#### 索引

索引很灵活，可以用 `:` 和 `,` 分隔，`...` 表示这一维度不要求，也可以是数组下标、布尔和表达式。

```Python
a = np/torch.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])  
b = a[1, ...]                            # [4, 5, 6]
b = a[..., 1:]                           # [[2, 3], [4, 5], [7, 8]]
b = a[[0, 2]]                            # [[1, 2, 3], [7, 8, 9]]
b = a[[0, 1, 2], [0, 1, 0]]              # [1, 5, 7]
a[a < 0.5] = 0                           # 将 <=0.5 的值置为 0
np/torch.where(a > 0.5, a, 0)            # 将 <=0.5 的值置为 0
np/torch.where(a > b, a, b)              # 取两个张量每位的最大值
```

#### 维度变换

|      操作      |                            numpy                             |                            torch                             |
| :------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|   原维度拼接   |             `np.concatenate((a, b,...), axis=0)`             |                  `torch.cat([a, b], dim=0)`                  |
| 创建新维度拼接 |                  `np.stack([a, b], axis=0)`                  |                 `torch.stack([a, b], dim=0)`                 |
|    维度分割    | `np.split(a, size/indices, axis=0)` </br> 支持固定大小或不均匀分割 | `torch.split(a, size, dim=0)` </br> 只能按固定大小均匀分割，末块可能偏小 |
|    维度分块    | `np.array_split(a, chunks/indices, axis=0)` </br> 支持固定块数或不均匀分割 | `torch.chunk(input, chunks, dim=0)`</br> 只能按块数均匀分割，末块可能偏小 |
|    压缩维度    |                  `np.squeeze(a, axis=None)`                  |   `torch.squeeze(a, dim=None)` </br> `a.squeeze(dim=None)`   |
|    增加维度    |                  `np.expand_dims(a, axis)`                   |   `torch.unsqueeze(a, dim)` </br> `a.unsqueeze(dim=None)`    |
|    维度平铺    |                    `a.flatten(order='C')`                    |                `torch.flatten(a)/a.flatten()`                |
|   每维块填充   |                      `np.tile(a, reps)`                      |             `torch.tile(a, reps)/ a.tile(reps)`              |
|    元素填充    | `np.repeat(a, repeats, axis=None)` </br> 只支持操作某一维，但元素可不规则复制 | `a.repeat(*sizes)` </br> 支持多维复制，每维仅支持元素等倍复制 |
|   重排所有维   |            `np.transpose(a, axes)` 仅支持全量维度            | `torch.permute(a, dims)` </br> `a.permute(dims)` 可支持部分维度 |
|    交换两维    |                `np.swapaxes(a, axis1, axis2)`                | `torch.transpose(a, dim0, dim1)` </br> `a.transpose(dim0, dim1)` |
|    调整形状    |    `np.reshape(a, newshape)` </br> `a.reshape(newshape)`     |   `torch.reshape(a, newshape)` </br> `a.reshape(newshape)`   |
|    调整形状    |                    `a.reshape(newshape)`                     |              `input.view(*shape)` 要求内存连续               |
|   内存连续性   |                `a.flags['C_CONTIGUOUS']` 检查                |                `input.contiguous()` 强制连续                 |

#### 爱因斯坦求和约定

爱因斯坦求和约定（einsum）提供了一套既简洁又优雅的规则，可实现包括但不限于内积、外积、矩阵乘法、转置等张量操作。第一个参数是个带有 $\rightarrow$ 的字符串，第二个参数是所有参与输入的张量列表。字符串里用 $26$ 个英文小写字母来索引张亮，箭头左边表示输入张量（以逗号分割），箭头右边表示输出张量。

+ 表示维度的字符只能是 $26$ 个英文字母 $\text{[a-z]}$。
+ 箭头左边不同输入之间重复出现的索引表示把输入张量沿着该维度做乘法操作。
+ 只出现在箭头左边的索引在计算中间结果时需要在这个维度求和，被称为求和索引（*Summation Indices*）。
+ 右边的索引顺序可以是任意的，会导致输出结果发生转置；右边的输出张量可以省略，按照默认规则推导。
+ 当某个索引在右边出现且在左边部分出现时，会遵照多维矩乘在求和前进行这一维度的广播。
+ 字符串里支持省略号，表示用户并不关心的索引。

numpy 和 pytorch 的 einsum 函数接口完全一致，下面以 torch 举例：

```python
torch.einsum("ik,kj->ij", [a, b])         # 矩乘，等价操作 torch.mm(a, b)
torch.einsum('ij->ji', [a])               # 矩阵转置
torch.einsum('...ij->...ji', [a])         # 高维张量转置
torch.einsum('ij->', [a])                 # 全部求和
torch.einsum('ij->j', [a])                # 按列求和
torch.einsum('ik,k->i'/'ik,k', [a, b])    # 矩阵和向量的乘法
torch.einsum('bhmd,hmnd->bhmn', [a, b])   # 把 a=bhm1d 和 b=1hmnd 在 d 维相乘并求和
```

#### 函数计算

```Python
np.random.choice(na, size, replace, p)   # 随机取 a 中 size 个, replace 表示是否放回
np.unique(na, return_index=True)         # 将 b 数组去重，默认会给出排好序的结果
np.argsort(na, axis = [])                # 按 axis 轴排序，返回相等大小的索引矩阵
sort(na, axis=-1, kind='quicksort')      # 若 axis=None 则先展平再排序
np.min()/max()/mean()/sum()              # 均可指定轴；均可用 ndarray 调用

np.sin()/cos()/tan()/log()/exp()         # 均可套 ndarray
np.multiply() / na * nb                  # 对应元素相乘
np.power(x1, x2)                         # x2 可以是等列数的矩阵，表示乘方次数
np.matmul(na, nb) / na @ nb              # 矩阵乘法 
np.dot(na, nb)                           # 若向量则是点积，若矩阵则是矩乘
np.linalg.det(na)                        # 矩阵行列式
np.linalg.inv(na) / na.I                 # 矩阵求逆 
na.transpose() / na.T                    # 矩阵的转置

ta.min(dim=1)                            # 返回(values, indices)
ta.max(dim=0, keepdim=True)              # 保持输出维度
ta.mean(dim=(0, 2))                      # 多维度求平均
ta.sum()                                 # 全局求和
torch.amin(ta, dim=1)                    # 指定维度最小值

torch.sin(ta)/cos(ta)/exp(ta)            # 逐元素运算
ta * tb                                  # 逐元素乘
torch.mm(ta, tb)                         # 矩阵乘法（2D 不支持广播）
torch.matmul(ta, tb)                     # 支持广播的多维矩阵乘
torch.dot(v1, v2)                        # 向量点积
torch.norm(ta, p=2, dim=1)               # L2范数

torch.multinomial(ta, num_samples=2)     # 按概率采样
torch.randperm(10)                       # 随机排列
```

#### 周边操作

```Python
ny.save(file, na, allow_pickle=True)     # 将 a 保存至二进制文件（后缀名为 npy）
np.savez("runoob.npz", *args, **kwds)    # 保存多个数组，如果非字典形式会被自动标号
nb = np.load(file)                       # 如果读入的是 savez 后的文件会得到 dict
np.savetxt(file, na, fmt="%d")           # 保存至普通 txt 文件
np.loadtxt(file, delimiter=' ')

ta.to('cuda')                            # 移动设备
ta.requires_grad_(True)                  # 启用梯度追踪
ta.detach()                              # 返回无梯度副本
ta.cpu().numpy()                         # 转 numpy 数组（需先放入 CPU）

# numpy 和 torch 互转
na = ta.numpy()
ta = torch.from_numpy(na) 
```

## 基础语法

变量是将名字和对象关联起来，变量名是对象的引用而不是对象本身。

+   **可变对象** 的内存地址可以改变，也可以修改当前指向的对象的值，例如列表、字典和集合等；
+   **不可变对象** 的内存地址永远不会改变，无法修改其值，例如整数、浮点数和字符串等。

```python
a, b = [0] * 10, [{}] * 10          # 生成内容的地址均相同
print (id(a[0]) == id(a[1]))        # True
print (type(a[0]), type(b[0]))      # <class 'int'> <class 'dict'>
a = b; a = b[:]                     # 前者单纯地改变内存地址，后者能复制一份列表 b
```

数值类型和字符串类型的基础运算

```python
0x(1), 0o(1), 0b(1)                # 十六进制，八进制和二进制的字面量
hex(), oct(), bin()                # 转化成十六进制，八进制和二进制
int(a, base = 10)                  # 转化成 base 进制
a = 2+3j                           # 定义复数
print (a.real, a.imag)             # 2 3
print (10 > 6 < 8)                 # True
### <20 左对齐，>20 右对齐，^20 居中。默认左对齐。
print("{0:.2f}{1:20s}".format(1.2, "123"))   # 1.20123
print("{0:a<10d}".format(1))                 # 1aaaaaaaaa
print(r"hello\nworld")                       # hello\nworld
'2' * 3                                      # 将字符串重复三遍
print (ord('我'), chr(25105))                # 25105 我
```

关于列表和迭代器

```python
a = [True, False]
any(a)/all(a)/sum(a)/max(a)...      # 对迭代器进行运算
for id, element in enumerate(a)     # 带序号遍历列表
i, _, j = [1, 2, 3]                 # 解包，i=1, j=3
i, *j = [1, 2, 3]                   # 解包，i=1, j=[2,3]
a.insert(index, x)                  # 在 index 处插入元素 x
a.pop(index); del a[index]          # 删除列表第 index 个元素
a.remove(val)                       # 删除值为 val 的元素（仅删除第一个）
a = b[:]; a = b.copy()              # 复制一份列表 b
sorted(iterable[,key[, reverse]])   # 对列表/迭代器进行排序，返回新的结果
```

集合的元素和字典的键必须是不可变对象。

```python
a.issubset(b); a<b;                 # 判断 a 是否是 b 的子集
a.issuperset(b); a>b                # 判断 a 是否是 b 的超集
a.union(b); a|b                     # 求 a 和 b 的并集
a.intersection(b); a&b              # 求 a 和 b 的交集
a.difference(b); a-b                # 求 a 和 b 的差集
a.symmertric_difference(b); a^b     # 求 a 和 b 的对称差集
# 列表去重并保持原有的顺序
mailto = ['cc', 'bbbb', 'afa', 'sss', 'bbbb', 'cc', 'shafa']
addr_to = list(set(mailto))
addr_to.sort(key = mailto.index)

fac={1:"00", 2:"00"}                # 初始化字典
fac=dict(math="01", python="02")    # 键是字符串时初始化可省略引号
max(dict, key = vote.get)           # 取字典里的元素最大值
del a[key]; a.pop(key)              # 后者能额外返回被删除的值
a.keys(), a.values(), a.items()     # 获得键列表、值列表、键值对列表
d = dict(zip(d.values(), d.keys())) # 字典的键值互换 

```

函数的参数调用分成位置参数、关键字参数、带默认值参数、可变数量参数四种。

```python
# 函数的默认参数值在函数对象被创建时计算一次
def init(arg, result=[]):
    result.append(arg)
    print (result)
init('a'), init('b')               # ['a'], ['a', 'b']
def sum(*a):                       # 把不定数量的位置参数打包成元组
def sum(**d):                      # 把不定数量的关键字参数打包成字典
```

lambda 函数会 **绑定全局变量地址而非其值**。以下代码的解决方案 [见此](https://docs.python.org/3/faq/programming.html#why-do-lambdas-defined-in-a-loop-with-different-values-all-return-the-same-result)。
```Python
funcs = []
for i in range(10):
    funcs.append(lambda x: x + i)
# 最后 funcs 里的十个函数都变成了：f(x) = x + 10
```

## 类

除了最常规的实例方法外，python 还有用 `@staticmethod` 修饰的静态方法和 `@classmethod` 修饰的类方法。实例方法依赖实例 self，类方法依赖类 cls 或实例 self，静态方法不依赖类和实例。

```python
class Example:
    static_attributes = "a"
    def object_method(self, name):
        print (name)
    @classmethod                     # 向类调用方式声明需要传入 cls，对象调用不受影响
    def class_method(cls):
        print (cls.n1)
    @staticmethod                    # 向对象调用方式声明不需要传入 self，类调用不受影响
    def static_method():
        print(Example.attributes)    # 静态方法调用静态变量
e = Example()
e.object_method("b")
Example.static_method()              # 类名调用静态方法，可以不加 @static_method
e.static_method()                    # 对象名调用静态方法，必须加 @static_method
Example.class_method()               # 类名调用静态方法，必须加 @class_method
e.class_method()                     # 对象名调用静态方法，可以不加 @class_method
```

类的继承用 `class B(A)`，如果想定义抽象类则需引入 abc 库。

```python
from abc import ABC, abstractmethod

class MyAbstractClass(ABC):
    @abstractmethod
    def my_abstract_method(self):
        pass
```

Python 的类不存在严格意义上的私有成员，保护成员和私有成员常用 `_` 和  `__` 作为前缀。

```python
class Example:
    __n1 = "a"             # 私有，需通过 _Example__n1 访问
    def __init__(self):
        self.__2 = "b"     # 类的私有属性，外部不能直接访问，需通过 _Example__n2 访问 
    def __n3(self):        # 类的私有方法，外部不能直接访问，需通过 _Example__n3 访问
        print (self.__n2)   
    def _n4(self):         # 类的保护成员，外部可以直接访问，不受 from module import * 影响
        pass
    @property              # 能以属性的方式查询
    def n2(self):
        return self.__n2
    @n2.setter             # 能以属性的方式修改
    def n2(self, n2):
        self.__n2 = n2

print (e.__n2)             # AttributeError: 'Example' object has no attribute '__n2'
print (e._Example__n2)     # b
```

其中，`__xxx__` 是系统定义的特殊的类方法。

| 类或函数的方法               | 效果                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| `dir()`                      | 类或对象的所有属性和方法（列表形式）                         |
| `__dict__`                   | 类或对象中的所有属性和值（字典形式）                         |
| `__doc__`                    | 描述信息，即定义开头长注释里的字符串；可用于模块、函数、类。 |
| `__new__`，`__init__`        | 前者用于类对象的创建（静态方法），后者用于对象的初始化（实例方法）。前者必须要给出返回值（对象），作为后者的第一个参数。 |
| `__del__`                    | 类的析构函数                                                 |
| `__module__`，`__class__`    | 前者表示对象所在模块，后者表示对象所属的类                   |
| `__str__`                    | 类需要转为字符串时（比如打印该对象）触发                     |
| `__call__`                   | 当对象后面接 `()` 后会触发                                   |
| `__getitem__`                | 当对象后面接 `[]` 后会触发                                   |
| `__setitem__`，`__delitem__` | 连同上面的 `__getitem__`，使类像字典一样使用                 |
| `__iter__`， `__next__`      | 使该类变得可迭代，可以用 `for ... in ...` 遍历               |

## 标准库

#### argparse 参数解析

```python
import argparse
parser = argparse.ArgumentParser(description="...")
# 增加一个必须的位置变量，且不允许简写
parser.add_argument('param1', type=str, required=True, allow_abbrev=False)
# 增加一个可选参数 --verbose，若用户带上则 parser.verbosity 为真
parser.add_argument("-v", "--verbosity", help="help_doc", action="store_true")
# 只能在 choices 里选择值，否则会报错
parser.add_argument("-v", "--verbosity", type=int, choices=[0, 1, 2], default=0)
# 计数命令行里 --verbosity/--v 的个数
parser,add_argument("-v", "--verbosity", action="count"， default=0)
# 不允许 --verbose 和 --quiet 同时存在
group = parser.add_mutually_exclusive_group()
group.add_argument("-v", "--verbose", action="store_true")
group.add_argument("-q", "--quiet", action="store_true")
args = parser.parse_args()
```

#### collections 拓展数据结构

```python
'''
namedtuple 具名数组，支持用属性名去访问元组
''' 
import collections.namedtuple 

User = namedtuple('User', ['name', 'age', 'id'])
User = namedtuple('User', 'name age id')

user = User('tester', '22', '001')
user = User._make(['Runoob', 'male', 12])
user = user._replace(age = 22)

print (user)          # User(name='user1', sex='male', age=21)
print (user._asdict)  # 将其转化为字典
print (user._fields)  # 获取所有字段名

'''
Counter 是 dict 的子类，用于计数可哈希对象
'''
from collections import Counter
# 转换成 dict 再统计
occ = dict(Counter(lst))
num = max(occ, key = occ.get)
# 直接用 Counter 的方法
Counter(lst).most_common(k = top_k)    # 返回出现次数前 top_k 的数字+次数的元组
```

#### functools 高阶函数

```python
import functools

def multiply(x, y): return x * y
double = functools.partial(multiply, y=2)
print (double(1))

from functools import cmp_to_key

def compare(ele1, ele2):
    return ele2 - ele1
a = [2, 3, 1]
# 把基于两个数的 cmp 模式转化成基于单个数的 key 模式
print(sorted(a, key=functools.cmp_to_key(compare)))
```

#### itertools 实用的枚举方法

itertools 的所有方法都实现了生成器函数，高效而节省内存。

```python
from itertools import permutations, combinations, product
permutations(list, r = len(list))        # list 里长度为 r 的所有排列
combinations(list, r)                    # list 里长度为 r 的所有组合
product(list1, list2, ...)               # 所有 list 的笛卡尔积
```

#### json & pickle 序列化和反序列化

json 兼容标准的 JavaScript Object Notation 协议。

```python
json.load(open('demo.json','r'))
json.loads('{'a':'1111','b':'2222'}')
json.dump(dict_or_list, open('demo.json', 'w'), indent = 2)
a_str = json.dumps(a_dict)
```

pickle 是 Python 专有基于二进制的序列化和反序列化。对不信任的数据进行 unpickling 是不安全的。

```python
pickle.load(open('a.txt', 'rb'))
pickle.dump(a, open('a.txt', 'wb'))
```

#### random 随机

```python
from random import *

random.seed(seed)    # 设置随机种子（不设置每次会变）
random()             # 返回 [0,1) 之间的浮点数。
uniform(a, b)        # 返回 [a,b] 之间的浮点数。
randint(a, b)        # 返回 [a,b] 之间的整数。
choice(seq)          # 返回 seq 里随机的一个数。
shuffle(seq)         # 打乱列表 seq。
sample(seq, k)       # 从 seq 里随机获得 k 个数。
```

#### re 正则表达式

```Python
import re
re.compile(pattern[, flags])    # 编译一个正则表达式；调用以下函数时可以减少 pattern 这个参数
re.search(pattern, string)      # 扫描整个字符串并返回第一个成功的
re.match (pattern, string)      # 从字符串起始位置开始匹配
re.findall(pattern, string)     # 扫描整个字符串并返回所有匹配成功的子串的 list
re.sub(pattern, repl, string)   # 把 string 里所有极大 pattern 的改成 repl
```

## 第三方库

#### pyparsing 定制解析器

#### tesserocr & pytesseract 图片文本检测

对给定图片进行文本检测，并返回识别后的字符串。

注意不太适合很小的图（比如只包括一个字符），进行适当的缩放和重复会有更好的识别效果。

#### Sympy 数学表达式运算

[比较详细的中文介绍](https://www.jianshu.com/p/339c91ae9f41)。

```python
x = sympy.Symbol('x')                   # 定义一个量 x
fx = 5 * x + 4                          # 可以正常放入表达式运算
fx.free_symbols                         # 返回 fx 里的 Symbol 集合
y1 = fx.evalf(subs={x:6})               # 计算表达式的数值结果
y = sympy.pi * sympy.Symbol('y')        # 注意 sin, pi 等要用 sympy 库里的
dx = sympy.diff(fx, x)                  # fx 关于 x 求导
sympy.integrate(fx, (x,0,1))            # fx 关于 x 定积分（只传一个 x 就是不定积分）

'''
解方程；方程列表，未知数列表（可不写）
dict = True：返回的一个 list 记录多解信息，list 里的每个元素是一个 dict 解集
manual = True：手动解，加上会比较稳定、比较快，但是 = False 更适合求联立的方程
rational = None/False/True：None 表示全用浮点数解，False/True 表示里面用分数解，返回值是浮点数/分数。
''' 
sympy.solve([fx, 2*y-1], (x, y), dict = True)   
```

####  Jupyter Notebook

即写即用，一直缓存结果，适合 python 开发。不推荐原生工具，VSCode 更好用。

在 notebook 里展示图片：
+   用 `cv2.imshow("WindowsName", a)`  无法正常显示图片，需要再后面加 `cv2.waitKey(delay)`，如 `delay=0` 则跳出一张图片（鼠标关闭后才会继续运行）。
+   用 `plt.imshow(a)` 可以画出 `a`，但是会在代码运行完后再画。
+   用 `plt.imshow(a); plt.show()` 后可以立即输出图片（也可以连续画出多张图片）。