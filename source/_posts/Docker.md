---
categories: Dev
cover: ../post_images/Docker.png
description: 记录了 Docker 相关的工程知识。
date: 2022-05-04 10:41:10
tags: [Tutorial, Docker]
title: Docker
updated: 2023-07-27
---

Docker 是一个很基本的工程工具。本文总结自 《每天5分钟玩转Docker容器技术》。

## 容器简介

容器核心技术包括以下内容：

+ 规范：Docker、CoreOS、Google 等公司成立了 Open Container Initiative 制定容器规范。
+ runtime：为容器提供运行环境，包括 lxc（老牌）、runc（Docker 默认） 和 rkt（CoreOS 开发）。
+ 管理工具：lxd（对应 lxc）、docker engine、rkt cli（对应 rkt）。
+ Registry：存放和管理镜像的仓库。
+ 容器 OS：与传统 OS 相比体积较小，运行效率高，包括 CoreOS、atomic、ubuntu core。

容器平台技术包括以下内容：

+ 容器编排引擎：把容器有机地组合成微服务应用，进行容器管理、调度、集群定义和服务发现等。
    + docker swarm：Docker 公司开发。
    + kubernetes：Google 开发，同事支持 Docker 和 CoreOS。
    + mesos+marathon。
+ 容器管理平台：抽象了上述引擎的底层细节，是一个更为通用的平台。包括 Rancher 和 ContainerShip。
+ 基于容器的 PaaS：主要代表为 Deris、Flynn、Dokku。

容器支持技术包括：网络、服务发现、监控、数据管理、日志管理、安全性。

Docker 的核心组件包括：client、docker daemon、image、container、Registry。

+ 客户端 client、服务器 docker daemon：可以在同一个 host 上交互，也支持通信。
+ 镜像 image：只读模板，可以从零开始搭建，也可以从别的 image 修改而来。
+ 容器 container：Docker 的运行实例，可以从 image 中拓展而来。

## Docker 镜像

Docker 采用分层结构，base 建立在 kernel 之上，随后一层一层叠加镜像，最上面是容器层。

+ 分层结构最大的好处是能共享资源：镜像能被多个容器共享。
+ 只有容器层是可写的，容器层下面的所有镜像层都是只读的。
+ Copy-On-Write 特性
    + 在容器中读取文件时，docker 会从上到下在各镜像层查找此文件，找到后读入内存并停止。
    + 在容器中修改文件时，docker 会从上到下在各镜像层查找此文件，复制至容器层进行修改。
    + 在容器中删除文件时，docker 会从上到下在各镜像层查找此文件，在容器层记录删除操作。
+ Docker 会缓存已有镜像的镜像层，以供快速使用。一层有改动后，其上层的所有缓存都失效。

镜像可以用 `docker commit` 手动构建，但最好通过写 dockerfile 来构建。Dockerfile 会按指令顺序重复以下操作：对容器做修改、生成新的镜像、根据新镜像运行容器。一个简单的创建镜像的例子：

1. dockerfile 上写 `RUN apt-get update && apt-get install -y vim`
2. 根据 dockerfile 创建命令：`docker build -t <image_name> -f <dockerfile_path>`

`docker images` 查看所有镜像的信息，`docker history <image_name>` 查看指定镜像的构建历史。

`RUN`、`CMD` 和 `ENTRYPOINT` 这三个 Dockerfile 指令都有运行的含义。

+ `RUN` 通常用于安装应用和软件包，支持 Shell 格式和 Exec 格式。
+ `CMD` 用于设置容器启动后默认执行的命令和参数，整个 dockfile 中只有最后一条 `CMD` 有效，会被 `docker run` 的命令和参数 **替换**。支持 Exec 格式 和 Shell 格式（建议前者），也可为 `ENTRYPOINT` 提供额外参数。
+ `ENTRYPOINT` 也可以指定命令和参数，但是不会被 **替换**（除非使用 `docker run --entrypoint xxx`）。Exec 格式可以配合 `CMD` / 输入参数形成串联；Shell 格式则会忽略任何 CMD 或 `docker run` 提供的参数。

~~~dockerfile
ENTRYPOINT ["/bin/echo", "Hello"] 
CMD ["word"]
# docker run -it [image] --> Hello world
# docker run -it [image] test --> Hello test
~~~

## Docker 的容器操作

容器一般分为工具类（busybox、ubuntu、debian）和服务类（web server、数据库）。

容器靠 `docker run` 指定的命令或是 `CMD/ENTRYPOINT` 启动，其运行状态取决于该命令的生命周期。`docker run` 本质上是 `docker create` 和 `docker start` 的组合。

使用 `--name` 和 `docker rename` 来命名。可以用容器名称、长 ID、短 ID 来定位某个容器。

~~~shell
docker run ubuntu pwd
# print and exit
docker run ubuntu /bin/bash -c "while true; do sleep 1; done"
# occupy one terminal (run endlessly)
docker run --name "my http server" -d httpd
# use -d to run in the back endlessly
docker stop unbuntu
# stop a container
~~~

`docker ps / docker container ls` 可以查看当前运行的容器，加上 `-a` 会额外显示已经退出的容器。

`docker logs -f <container>` 可以查看容器启动命令后的输出。

`docker attach` 或 `docker exec` 可以进入在后台运行的容器。

+ attach 是直接进入容器里，如果执行 `exit` 会打断正在运行的容器。
+ exec 是在容器里打开新的终端，所以用 `exit` 不会打断容器的运行，推荐使用此方案。
    + `-i`：即使没有附加也保持 STDIN 打开；`-t`：分配一个伪终端。
    + 常用命令：`docker exec -it <container> bash`

`docker stop` 和 `docker kill` 可以停止容器，相当于往容器的进程里发送 `SIGTERM` 和 `SIGKILL` 信号。

对于已停止的容器可以用 `docker start` 唤醒，启动时保留上一次的所有参数。

`docker restart` 会依次执行 `stop` 和 `start`。也可以在 `docker run` 时加入 `--restart` 来自动重启。

+ `docker run -d --start=always` 意味任何时候退出都会自动重启。
+ `docker run -d --start=on-failure:3` 意思是退出就重启，但是最多三次。

`docker pause/unpause` 暂停容器运行（block CPU）和恢复容器运行。

`docker rm <container1> <container2>...`：删除容器，包括那些已停止但是保留参数的记录。

+ `docker rm -v $(docker ps -aq -f status=exited)` 删除所有已退出的容器（记录）。

+ 注意 `docker rmi` 是删除镜像。

 Docker 可以限制容器的内存和 CPU 的占有量。

+ `-m/--memory` 设置内存上限，`--memory-swap` 设置内存+swap的上限。后者默认是前者的两倍。
+ `-c/--cpu-shares` 设置 CPU 权重，默认是 `1024`。权重影响的是 CPU 的相对占有量。
+ 如果不设限制的话，默认没有内存上限，CPU 资源平等分配。

~~~shell
docker run -m 200M --memory-swap=300M ubuntu
docker run -it -m 200M --memory-swap=300M progrium/stress --vm 1 --vm-bytes 280M
# progrium/stress 是压力测试，--vm 指定数量，--vm-bytes 指定每个线程的内存，此时不会报错。
~~~

Docker 还可以限制容器的 IO 资源。

+ `--blkio-weight` 设置 IO 读写磁盘的权重， 默认是 `500`。
+ `--device-read-bps --device-write-bps --device-read-iops --device-write-iops` 来限制读/写某个设备的 bps/iops。bps 表示每秒读写的数据量，iops 是每秒 IO 的次数。

~~~shell
docker run -it --device-write-bps /dev/sda:30MB ubuntu
time dd if=/dev/zero of=test.out bs=1M count=800 oflag=direct    # <30MB/s
~~~

Docker 的资源 **限额** 技术本质上是 linux 的 Control Group 功能，其目录在 `/sys/fs/cgroup/` 下。

Docker 还利用了 linux 的 namespace 技术来实现容器资源的 **隔离**，对应以下六中资源。

+ Mount 让容器看上去拥有整个文件系统。
+ UTS 让容器拥有自己的 hostname（Docker 默认 hostname 为容器的短 ID，可以用 `--hostname/-h`）。
+ IPC 让容器拥有自己的共享内存和信号量来实现进程间通信，而不会和其他容器混在一起。
+ PID 让每个容器拥有自己的 PID。
+ Network 让容器拥有独立的网卡、IP、路由。
+ User 让容器管理自己的用户（host 里看不到容器里创建的用户）。

## Docker 的网络

`docker network ls` 可以查看当前网络， `docker network inspect <network_name>` 查看具体信息。

docker 安装时会创建三个默认网络 `bridge, host, none`。可以用 `--network` 指定网络。

+ `none` 网络指的是什么都没有封闭网络，起到隔离效果。
+ `host` 可以共享和主机的所有网络配置，方便但有可能会起冲突。`--privileged=true` 可以修改主机配置。
+ `bridge`：docker 启动时会在主机创建一个虚拟网桥，没指定 network 的容器都会挂到这个网桥里。

Docker 还提供三种用户自定义的网络驱动，`bridge, overlay, macvlan`，后两者用于创建跨主机网络。对于 `bridge` 驱动，用 `--subnet, --gateway` 指定网关和子网参数，用 `--ip` 指定静态参数（而非分配）。

容器之间通信有以下几种方式：

1. 通过 ip 通信。同一网桥可以直接通信，不同网桥的容器需要用 `docker network connect` 加网卡来通信。
2. `--network=container:<container_name_or_id>`：让新容器共享某个容器的所有网络配置。

容器访问外部网络时， iptables 会判断出外发包并将源地址替换成 host 地址发出去。

外部网络访问容器需要做端口映射。用 `--port <docker_port>` 后会自动生成一个对外的端口（通过 `docker ps/port` 查看） ，也可以用 `--port <host_port>:<docker_port>` 指定端口映射。

## Docker 的存储

Docker 提供了两种存放数据的资源。storage driver 是无状态的，它分层管理镜像层，适合 busybox 等工具类容器；Data Volume 是有状态的，适合那些启动时需要加载已有的数据、销毁时需要保留数据的容器。

Docker 支持多种 storage driver，有 AUFS、Device Mapper、Btrfs、OverlayFS、VFS 和 ZFS。它们都能实现 Copy-On-Write 的分层架构，同时又有各自的特性。Docker 在安装时会根据 OS 选择一个默认的 driver，如 Unbuntu 用 AUFS，Redhat/CentOS 用 Device Mapper，SUSE 用 Btrfs。

Data Volume 本质上是共享主机上的目录或文件，可用容量即为主机剩余容量。

1. `docker run --volume <host_path>:<container_path>[:ro/z/Z]` 可以把容器里的路径 mount 到主机的文件/文件夹路径上，该路径如果不存在会被新建。默认是可读可写，可以用 `ro` 指定为可读，`z` 表示这个目录可以多容器共享，`Z` 表示是该容器私有的。以上命令等价于 `docker run --mount type=bind, source=<host_path>, target=<container_path>[, readonly]`，但是这种用法如果路径不存在会报错。
2. 如果 `--volume` 时没有冒号，视为只指定了容器路径，docker 会在主机里生成一个该容器专属目录，然后再该容器路径 mount 到该专属目录下。可以用 ` docker volume` 查看具体情况。 这种方法不需要指定主机的绝对路径，可以执行强。但是它只能支持目路，且不能控制读写权限（默认均能读写）。

上述是容器与主机共享数据，而容器之间共享数据有以下三种方法：

1. 最简单的操作是把不同的容器用上述第一种方法 mount 到相同的主机目录。
2. 也可以先定义一个 volume container ，后续容器可以直接绑定到这。

~~~shell
docker create --name share_volume -v <host_name>:<docker_name1> -v <docker_name2> ...
docker run --name web1 -d --volumes-from share_volume httpd
docker run --name web2 -d --volumes-from share_volume httpd
docker run --name web3 -d --volumes-from share_volume httpd
# 以上三个容器都可以使用 share_volume 里的两种 volume。
~~~