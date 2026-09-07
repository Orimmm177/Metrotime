# Metrotime

可部署到 GitHub Pages 的个人论文阅读档案，基于 **TypeScript + React + Vite**，无后端。

支持论文卡片／列表视图、关键词搜索、研究方向筛选、收录／发表日期排序、浏览器本地收藏、推荐阅读与移动端布局。每份报告是独立 HTML，支持目录跳转、返回首页和打印。

论文清单初始为空，不包含示例论文。当前研究方向为 **WAM、Deep Learning、LLM**，尚未收录论文的方向也会显示。

## 本地启动

使用 Node.js 22 和 npm：

```bash
npm ci
npm run dev
```

生产构建和验证：

```bash
npm test
npm run build
npm run preview
```

`build` 先校验论文清单与文件，再执行 TypeScript 检查并生成 `dist/`。Vite 使用相对资源路径，兼容根域名和 `/Metrotime/` 仓库子路径。首页不依赖服务器路由重写。

## GitHub Pages 部署

1. 将代码推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. `.github/workflows/deploy.yml` 会在推送后自动验证、构建并发布，也可在 Actions 中手动运行。
4. 工作流成功后，当前仓库预期网址为 `https://orimmm177.github.io/Metrotime/`。本地生成代码并不代表已上线。

更换默认分支时，同步修改工作流的 `branches`。部署方式参考 [Vite 官方 GitHub Pages 指南](https://vite.dev/guide/static-deploy.html#github-pages)。

## 添加一篇论文

1. 将独立 HTML 保存到 `public/papers/my-paper.html`，可复用 `report.css` 或使用自己的完整页面。
2. 在 `public/papers.json` 数组中追加记录：

```json
{
  "id": "my-paper",
  "title": "论文英文标题",
  "subtitle": "一句话中文解读",
  "summary": "研究问题、方法和价值的简要概括。",
  "authors": "Author et al.",
  "category": "LLM",
  "tags": ["Transformer", "Reasoning"],
  "published": "2026-09-01",
  "added": "2026-09-07",
  "readingMinutes": 12,
  "source": "arXiv",
  "sourceUrl": "https://arxiv.org/abs/替换为真实编号",
  "htmlPath": "papers/my-paper.html",
  "featured": false,
  "demo": false
}
```

3. 执行 `npm test` 和 `npm run build`，确认报告能打开、来源真实且引用准确。
4. 提交并推送，部署后新报告会自动出现在首页，无需修改 React 组件。方向计数自动更新，论文使用的新方向也会自动出现在筛选和导航中。

字段约定：

- `id`：稳定且唯一，用于本地收藏；不要随标题修改。
- `htmlPath`：相对 `public/`，必须以 `papers/` 开头、以 `.html` 结尾；文件名和子目录使用英文、数字、连字符或下划线。
- `added`：报告收录日期；`published`：论文首发日期。使用真实的 `YYYY-MM-DD` 日期。
- `featured`：可选，最多一篇为 `true`；没有推荐时首页推荐区域隐藏。
- `demo`：可选，示例内容设为 `true`，正式分析设为 `false`。
- `visual`：可选，概念图样式为 `attention`、`lora`、`vit`、`rag`、`dpo`、`resnet`；省略时使用默认注意力示意图。这些是装饰性概念示意，不是论文原图。
- `sourceUrl`：论文真实的 HTTPS 原文地址。
- `readingMinutes`：按实际报告长度估算的正整数。

普通报告的返回链接使用 `../index.html`；嵌套目录里的报告应调整相对层级。报告资源使用相对地址，避免写死 `/papers/...`，以兼容 GitHub Pages 仓库子路径。

## 维护研究方向

编辑 `src/research-directions.json` 即可添加、排序或删除预设方向。首页会合并预设方向与已收录论文的 `category`，自动去重；没有论文的预设方向仍然显示。删除一个仍被论文使用的方向时，需要同步调整对应论文的 `category`。

`skills/` 已加入 `.gitignore`，本地报告主题 Skill 不随项目提交；已安装的个人 Skill 不受影响。

## 衔接周期性 Codex 任务

本站负责展示，**不会在浏览器内定时抓取论文或运行 Codex**。当前没有创建自动任务。后续可以给外部 Codex 任务提供研究来源、执行时间和筛选条件，并采用以下约定：

> 阅读指定网站的新论文，核对原始来源，并按研究问题、相关工作、核心方法、关键公式、实验与证据、局限性、复现要点和进一步思考生成独立 HTML。将文件保存到 public/papers/，更新 public/papers.json；以稳定 ID 去重，保留已有记录。注明原文链接、论文发表日期和本次收录日期，区分原文结论与分析者推断。运行 npm test 与 npm run build；在预览确认内容和链接正确后，按已授权的提交规则提交并推送到部署分支。

## 目录

```text
src/
  App.tsx                 首页及阅读交互
  Diagram.tsx             论文概念示意图
  papers.ts               数据类型、运行时检查与路径
  research-directions.json 预设研究方向
  styles.css              响应式样式
public/
  papers.json             论文清单
  papers/*.html           独立分析报告
  papers/report.css       报告阅读样式
scripts/
  validate-papers.mjs      发布前数据与文件检查
  validate-papers.test.mjs 校验器测试
.github/workflows/
  deploy.yml              GitHub Pages 自动部署
```

收藏通过 `localStorage` 保存在当前浏览器，不跨设备同步。Google Fonts 加载失败时使用系统字体；正文与概念图不依赖远程图片。更换仓库时修改 `src/App.tsx` 的 `githubUrl`。
