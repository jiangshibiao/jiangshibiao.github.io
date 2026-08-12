---
categories: Dev
cover: ../post_images/Django.jpg
date: 2020-04-24 20:54:18
description: 记录了我 2020.3-2020.6 在浙江大学上的《BS体系软件设计》这门课的课程设计所用到的后端知识点。
tags: [Course, Django, Web, Python]
title: Django 学习笔记
updated: 2023-07-27
---

我用 Django + Vue 的架构完成《BS体系软件设计》的课程设计，这篇文章对 Django 做简单的总结。

####  命令行操作

~~~~shell
django-admin startproject mysite                # 创建叫做 mysite 的 project
python manage.py startapp learn                 # 创建叫做 learn 的应用
python manage.py makemigrations                 # 生成迁移文件
python manage.py migrate                        # 将结构变化应用到数据库
python manage.py runserver <ip:port>            # 运行 urls.py 里指定的网页
~~~~

#### 简单的网页请求处理 views.py & urls.py
~~~python
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render

'''views.py'''
def add(request):
a = request.GET.get('a', 0)                               # request.GET 相当于字典
return render(request, 'home.html', {'string': string})   # 渲染一个静态页面
return HttpResponse(str(int(a)*2))                        # 返回一个响应
return HttpResponseRedirect(                              # 返回一个新地址
reverse('add2', args=(a, b))
)

'''urls.py'''
from django.urls import path
from django.conf.urls import url
urlpatterns = [
path('add/<int:a>/<int:b>/',   calc.views.add,  name = 'add')
url(r'^new_add/(\d+)/(\d+)/$', calc_views.add2, name = 'add2')
]

django.urls.reverse(<name>, args=())                          # 获得该函数所在地址
~~~

#### 静态模板 html 的使用
~~~django
<!-- 使用某个 views 里的函数来决定网址 -->
<a href="{% url '<name>' <arg1> <arg2> ... %}"> content </a>  

<!-- 显示 List 参数里的内容 -->
{% for i in TutorialList %}
{{ i }}
{% endfor %}

<!-- 显示 Dict 参数里的内容 -->
{% for key, value in info_dict.items %}
{{ key }}: {{ value }}
{% endfor %}

<!-- If 语句 -->
{% for item in List %}
{{ item }}{% if not forloop.last %},{% endif %} 
{% endfor %}

<!-- If 嵌套（比较符号前后必须至少有一个空格） -->
{% if var >= 90%}
成绩优秀
{% elif var >= 60 %}
成绩良好
{% else %}
不及格
{% endif %}

<!-- 连接符 and, or, not, in, not in -->
{% if 'Li Guanglin' in List %}
yes
{% endif %}

<!-- 当前用户，当前网址，当前 GET 参数 -->
{{ request.user }}    {{ request.path }}    {{ request.GET.urlencode }}
~~~

#### 与数据库交互 models.py

~~~python
from django.db import models
class Author(models.Model):
    name = models.CharField(max_length=50)
    email = models.EmailField()
    def __str__(self):
        return self.name

mysql -u root -p
~~~
1. QuerySet 创建对象
    ~~~python
    Author.objects.create(name = "", email = "")
    a = Author(name = ""); a.email = ""; save()
    Author.objects.get_or_create(name = "", email = "")   # 返回 (object, True/False)
    ~~~
2. QuerySet 的查询，删除和修改
    + 批量更新，适用于 `.all()`  `.filter()`  `.exclude()` 等后面。
    + 单个 object 更新，适合 `.get()` `get_or_create()`, `update_or_create()` 等后面。
    
    ~~~python
    Person.objects.all()[:10]                      # 切片不支持负数
    Person.objects.get(name = "")                  # 用来找一个对象（找到多个会报错）
    Person.objects.filter(name__exact = "ab")      # 找到所有 name 正好等于 ab 的对象
    Person.objects.filter(name__contain = "ab")    # 找到所有 name 包含 ab 的对象
    Person.objects.filter(name__regex = "^ab")     # 正则表达式查询
    Person.objects.exclude(name__contains = "ab")  # 找到所有不符合要求的
    # 关键词前面加 i 表示不区分大小写，如 name_iexact
    people = Person.objects.filter(name = "abc")
    people.delete()/update(name = "")              # 删除/修改
    ~~~
3. QuerySet 的其他操作
    ~~~python
    es = Person.objects.all()
    for e in es: print(e.name)                     # 可迭代
    list(es)                                       # 将 es 变成 list
    .exists(), .distinct() .count(), len()         # 是否存在，去重，个数
    Person.objects.all().reverse()[:2]             # 查看最后两条
    qs = qs1 | qs2 | qs3                           # 合并（会出现重复）
    ~~~