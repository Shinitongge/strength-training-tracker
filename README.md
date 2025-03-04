# 力量训练追踪应用

一个用于追踪和分析力量训练数据的 Web 应用程序。

## 功能特点

- 记录每次训练的动作、组数、重量和力竭情况
- 分析训练数据，包括：
  - 增肌组数对比
  - 负重对比
  - 最大重量对比
- 可视化训练进展
  - 短期vs长期表现对比
  - 趋势分析
  - 进度追踪
- 响应式设计，支持移动端和桌面端

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Chart.js
- Tailwind CSS

## 开始使用

1. 克隆仓库：
```bash
git clone https://github.com/Shinitongge/Shinitongge-strength-training-tracker.git
```

2. 安装依赖：
```bash
npm install
```

3. 运行开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 `http://localhost:3000`

## 构建部署

构建生产版本：
```bash
npm run build
```

运行生产版本：
```bash
npm start
```

## 数据存储

应用使用浏览器的 LocalStorage 存储训练数据，无需数据库。

## 许可证

MIT
