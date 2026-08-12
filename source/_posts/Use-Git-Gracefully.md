---
categories: Dev
cover: ../post_images/Use-Git-Gracefully.jpg
date: 2021-07-25 20:49:13
description: 记录了我对 Git 的系统性学习。
tags: [Digest, Git]
title: 优雅地使用 Git
updated: 2023-08-23
---

## 学习资源

+   [廖雪峰的中文 git 教程](https://www.liaoxuefeng.com/wiki/896043488029600)
+   英文书籍：Pro Git (Second Edition)

## 创建，修改，删除和移动

`git init`：将一个普通文件夹变为接受 git 管理的文件夹。

文件状态分为未跟踪（untracked）和已跟踪（tracked），后者包含未修改、已修改、已暂存三种状态。

`.gitignore` 里保存了所有需要忽略的文件。

+   支持标准的 glob 模式：`*` 匹配 0 或多个字符，`？`匹配单个字符，`a-b` 匹配 a-b 之间任何的单个字符。
+   空行或 `#` 开头的行会被忽略。用 `**` 匹配嵌套目录（0 或多层）。

`git status`：查看当前工作目录的文件状态。

+   按顺序显示已暂存列表、已修改未暂存列表和未跟踪列表。
+   如果文件 A 暂存后又进行了修改，这两个版本会分别出现在已暂存和已修改列表里。
+   `git status -s/--short`：显示更简洁的信息。

`git add <file1> <file2> ...`：将指定文件内容添加到下一次提交中。

+   该命令会把一个修改的文件移入暂存区，可以跟踪新文件，也可以在合并冲突时标记文件为已解决。
+   文件路径支持正则表达。如 `git add .` 表示移入所有。

`git diff [<commit>] [<path>...] `：比较文件差异，默认比较当前工作目录和上一次提交。

+   `git diff` 显示已改动但尚未添加到暂存区里的文件与上一次提交的差异。
+   `git diff --staged/cached` 显示暂存区里的文件与上一次提交的差异。
+   `git diff --no-index <path1> <path2>` 直接比较工作目录或磁盘上两个文件的差异。

`git rm <file>`：删除工作区中的 file 文件，并将这次改动记录进暂存区。

+   如果没有使用 rm 而是直接删除，并不会添加进暂存区，还需要手动 `git add/rm` 后才能 commit。
+   如果待删除的文件已经修改过（不管是否放入暂存区）会报错，此时需要加上 `-f` 来强制删除。
+   如果想删除放入暂存区的文件但是依然将其留在硬盘上（且后续不再跟踪它），加上 `--cached`。

`git mv <file_from> <file_to>`：移动/重命名文件。

## 提交和分支管理

`git commit -m "commit message"`：将暂存区的文件提交到当前分支。

+   `-a`：把所有已跟踪文件都强制移到暂存区并直接提交。
+   `--amend`：编辑上一次提交的 message。如果上一次提交以来有新的 add，也会合并进去。
+   `--date="xxx"`：修改 commit 时间，格式为：`Wed Jan 11 18:03:07 2023 +0800`。

`git branch`：查看所有分支（当前分支前面会有一个 `*`）。

+ `git branch <new-branch>`：创建新的分支 new-branch。
+ `git branch -d/--delete <branch>`：删除 dev 分支。
+ `git branch -r/--remote`：列举远端的所有分支。

`git checkout <branch>`：切换至 branch 分支。

+ `git checkout -b <branch>` ：创建并切换到 branch 分支。
+ `git branch -m <old-branch> <new-branch>`：重命名本地分支。

`git checkout -- <file>`：丢弃工作区里 file 文件的改动。

+   如果 file 还未被移入暂存区，就恢复成原先版本的样子。
+   如果 file 被移入暂存区但是又修改了，就恢复成移入暂存区的样子。

`git merge <branch>`：把 branch 分支合并到当前分支上。git 会对两个分支末的 commit 和 lca 三方合并。

+   若 file 有冲突，修改好后先 `git add <file>`  再 merge。
+   用 `--no-ff` 可以为 merge 后的结果创建一个新的 commit（当然也要设定一下 commit 信息），即：`git merge --no-ff -m "merge with no-ff" branch`。

`git rebase <branch>`：把当前分支变基到 branch 分支。git 会找到两者的 lca，把当前分支基于 lca 的改动保存为临时补丁，然后从 branch 分支开始依次添加这些补丁。

+ 用 `get rebase --continue` 继续应用下一阶段的补丁。
+ 用 `get rebase --abort` 终止 rebase 操作，并把当前分支回到 rebase 开始前的状态。

`get rebase -i [start point] [end point]` 调出交互界面编辑历史的提交信息。

| 命令   | 语义                                           |
| ------ | ---------------------------------------------- |
| pick   | 保留该提交                                     |
| reword | 保留该提交并修改该提交的信息                   |
| edit   | 保留该提交并修改该提交                         |
| squash | 将该提交和前一个提交合并，合并提交信息         |
| fixup  | 将该提交和前一个提交合并，但不保留该提交的信息 |
| drop   | 丢弃该提交                                     |

## 版本回退

`git log`：查看 commit 记录和历史版本信息。

+   `-<number>`：显示最近的 number 次提交。
+   `-p`：显示每次提交所引入的差异。
+   `--stat`：显示每个提交的摘要统计信息（改动的文件列表、有多少新增和删除行）。
+   `--pretty=oneline/short/full/fuller`：增加或减少显示信息。
+   `--since/after=<time>` ：显示某段时间以来的提交，如 `2.weeks/2008.01-15`。
+   `--until/before=<time>`：显示某段时间之前的提交。 

`git reset`：将当前 HEAD 回退至某个状态。当前版本简称为 `HEAD`，每往前一个版本须加一个 `^`。

+ `--mixed [<file, ...>]` ：默认参数，将暂存区里的所有文件或指定文件退回至未暂存状态。
+ `--soft [<commit-id>]`：回退至某个版本，保留工作目录和暂存区，并把版本差异文件也放入暂存区。
+ `--hard`：强制回退至某个版本，并清空工作目录和暂存区。

`git reflog`：查看操作（命令）记录。

+   注意：回退至之前某个版本后， `git log` 看不到未来的 commit 记录了。但是依然可以通过 `git reset --hard <commit-id>` 回到之后的版本。如果忘记了之后的版本号，可以先用 `git reflog` 查看。 

## 储藏和恢复工作区

+   `git stash` ：暂时把当前工作区 stash 起来并回到 HEAD 版本。默认情况下，只会缓存 stages changes 和 unstages changes 但是不会缓存 untracked files 和 ignored files。可以使用 `-u/--include-untracked` 额外存储 untracked 文件，`-a/--all` 存储当前目录下的所有修改。
+   `git stash list`：查看之前的 stash 记录。
+   `git stash apply`：恢复 stash 前的状态，但是保留 stash 记录。
+   `git stash pop`：恢复 stash 前的状态，并删除 stash 记录。
+   `git stash drop/clear`：删除栈顶/所有 stash 记录。
+   `git stash branch <name>` ：根据 stash 创建分支。

## 和远程仓库的交互

`git remote`：查看远程仓库的信息。

+ `--verbose/-v`：查看远程仓库的详细信息。
+ `git remote add <repository> <address>` 将本地的仓库和远端仓库的绑定关系。
+ `git remote rm <repository>` 解除本地仓库和远端仓库的绑定关系。

`git push [<repository> [<local-branch>[:<remote-branch>]]` 将分支上传至远端服务器。

+   `-f/--force`：强制覆盖远端分支，不再要求远端分支是本地分支的祖先。
+   `-u/--set-upstream` 将本地分支关联远端分支，下一次 push 时不必再指定。
+   `-d/--delete` 删除远端的分支。
+   ` --no-verify` 取消 pre-push hook 的检查。

`git pull` 的本质是 `git fetch + get rebase/merge`。

+ `--rebase/--no-rebase` 指定合并方式，默认是 `--no-rebase`。
+ `--commit/--no-commit` 合并后是否立即创建新提交。

## 常见场景

**修改当前分支的名称，并同步修改远端的分支**

```bash
git branch -m <old-branch> <new-branch>
git push --delete origin <old-branch>
git push origin <new-branch>
git branch --set-upstream-to origin/<new-branch>
```