
---
title: 从 Hexo 升级到 Astro：现代化博客搭建指南
description: 使用 Astro 和 GitHub Actions 搭建高性能、自动化部署的个人博客
author: RipZhouDi
date: 2026-04-05
tags:
  - Astro
  - GitHub Pages
  - GitHub Actions
  - 博客搭建
  - TypeScript
pubDate: 2026-04-05
---

太有品味了！既然你已经体验过了经典的 Hexo，那么尝试 Astro 绝对会让你耳目一新。
Astro 是目前前端圈最火的现代化静态网站生成器。相比 Hexo，它有两个巨大的优势：

- **原生支持现代前端技术** — 你可以直接在里面混用 React、Vue、TailwindCSS 等。
- **极其丝滑的部署体验** — 我们不再需要手动建 gh-pages 分支了，使用 GitHub Actions 自动化流水线，你只管推源码到 main，GitHub 服务器会自动帮你在云端打包并发布网页！

如果你准备好了，我们这就把你的仓库改造成 Astro 架构。
## 第 0 步：清空旧仓库（如果你要复用之前的仓库）

如果你打算继续使用 `RipZhouDi.github.io` 这个仓库：

1. 去 GitHub 网页端，把你之前的 gh-pages 分支删掉（如果有的话）
2. 把 main 分支里的文件全部删掉（保持仓库为一个纯净的空仓库）
3. 在你的本地电脑上，新建一个完全干净的文件夹（不要用之前那个了），比如命名为 `AstroBlog`
## 第 1 步：本地初始化 Astro 博客

打开终端，进入你新建的 AstroBlog 文件夹，执行官方创建命令：

```bash
npm create astro@latest
```

这时候终端会启动一个交互式的向导（按键盘上下键选择，回车确认）：

1. **Where should we create your new project?** 输入 `.`（一个点，代表安装在当前目录），或者直接起个名字比如 `my-blog`
2. **How would you like to start your new project?** 强烈建议选择 **Use blog template**（官方自带的完美博客模板）
3. **Install dependencies?** 选 **Yes**
4. **Do you plan to write TypeScript?** 选 **Yes**（选 Yes 体验更好，即使你只会写 Markdown 也没关系）
5. **How strict should TypeScript be?** 选 **Strict**
6. **Initialize a new git repository?** 选 **Yes**

等待进度条跑完，你的本地 Astro 源码就生成好了！

你可以输入下面两行命令本地预览一下：

```bash
npm run dev
```

打开浏览器访问 `http://localhost:4321`，你会看到 Astro 官方极简且优雅的博客初始页面。看完后按 `Ctrl + C` 关闭。
## 第 2 步：配置 Astro 网址

用编辑器（推荐 VS Code）打开你的 Astro 项目。找到根目录下的 `astro.config.mjs` 文件，加入你的 site 域名：

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://RipZhouDi.github.io',  // <-- 加上这行，非常重要！
  integrations: [mdx(), sitemap()],
});
```
## 第 3 步：配置 GitHub Actions（自动部署的魔法）

这是 Astro 最酷的地方！我们要写一个脚本，告诉 GitHub：“只要我推送了源码，你就自动帮我打包生成网页并发布”。

1. 在你的项目根目录下，新建一个文件夹，严格命名为 `.github`
2. 在 `.github` 里面新建一个文件夹，命名为 `workflows`
3. 在 `workflows` 里新建一个文件，命名为 `deploy.yml`

把下面的代码原封不动地复制进 `deploy.yml` 文件并保存：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 第 4 步：推送到 GitHub 仓库

现在，我们要把配置好的源码推送到你的 GitHub 仓库。在终端执行：

```bash
# 1. 暂存所有文件
git add .

# 2. 提交代码
git commit -m "初始化 Astro 博客与自动化部署配置"

# 3. 关联你的远程仓库（注意替换你的真实仓库地址）
git remote add origin https://github.com/RipZhouDi/RipZhouDi.github.io.git

# 4. 推送到 main 分支
git push -u origin main
```

> 💡 **提示**：如果提示 `origin` 已存在，说明你之前关联过，直接忽略第三条，执行第四条即可

## 第 5 步：在 GitHub 上开启自动化部署通道

最后一步，去告诉 GitHub 允许机器人帮你发布网页：

1. 打开 GitHub 浏览器网页，进入你的 `RipZhouDi.github.io` 仓库
2. 点击顶部的 **Settings**（设置）
3. 点击左侧菜单的 **Pages**
4. **【最核心的一步】** 在 **Build and deployment → Source** 的下拉菜单中，选择 **GitHub Actions**（不要选之前的 Deploy from a branch 了）

### 见证奇迹的时刻：

1. 点击 GitHub 仓库顶部的 **Actions** 标签页。你会看到一个名为 "Deploy to GitHub Pages" 的任务正在自动运行（亮黄灯）
2. 等它变成绿色的打勾 ✔️（大概需要 30 秒 - 1 分钟），你的网站就已经部署成功了！
3. 访问 `https://RipZhouDi.github.io`，你会看到属于你的 Astro 现代博客已经完美上线！

---

## 🚀 Astro 的日常创作流（比 Hexo 更简单）

你以后再也不需要在本地执行 `hexo g` 或 `hexo d` 这种构建命令了。你的工作流极度精简：

### 1. 写文章

进入项目的 `src/content/blog/` 文件夹，新建一个 `.md` 或 `.mdx` 文件，开始写 Markdown。

### 2. 发布与备份（只需一次 Git Push）

```bash
git add .
git commit -m "发布新文章"
git push
```

**结束了！**

只要你执行了 `git push`，GitHub 服务器会自动接管剩余的工作，在后台默默帮你编译、打包并更新网页。你的本地仓库（main 分支）永远是纯净的源码！这就是现代前端的顶级魅力。