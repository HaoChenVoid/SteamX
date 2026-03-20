# Steam Deals Ultimate

一个可部署到 Vercel 的 Steam 风格折扣游戏网站项目，包含：
- Steam 风格首页
- Spotify 风格切换
- 搜索联想
- 多语言 / 多货币切换
- Steam 数据代理
- 评测数据代理
- 启动动画
- 总换码动画
- 本地保存设置与监控列表

## 安装

```bash
npm install
npm run dev
```

## 部署到 Vercel

1. 把项目推到 GitHub
2. 在 Vercel 中导入该仓库
3. 直接部署

## 说明

- 当前价格、简介、截图、视频、评测均通过 Steam 公开接口代理获取。
- 历史价格这版保留了可扩展结构，你可以继续接入自己的历史记录来源。
