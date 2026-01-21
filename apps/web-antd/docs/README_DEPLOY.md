# Vben Admin 部署快速指南

## 快速开始

### 1. 本地验证构建

```bash
# 在 apps/web-antd 目录下执行
chmod +x build-local.sh
./build-local.sh
```

### 2. 配置 Jenkins

1. 安装必要插件：
   - NodeJS Plugin
   - Publish Over SSH Plugin

2. 配置 SSH 服务器（复用已有配置）：
   - Name: `nginx-server`
   - Host: `182.92.106.252`

3. 创建 Pipeline 任务：
   - 仓库: `git@codeup.aliyun.com:676b69e335730943ed494c52/ruoyi-office/ruoyi-office-vben.git`
   - 脚本路径: `apps/web-antd/Jenkinsfile`

### 3. 配置 Nginx

在 Nginx 服务器(182.92.106.252)上执行：

```bash
# 创建部署目录
mkdir -p /data/nginx/html/web

# 添加配置（参考 nginx/web-antd.conf）
# 编辑 /data/nginx/conf/conf.d/default.conf 或创建新文件

# 验证并重新加载
docker exec nginx nginx -t
docker exec nginx nginx -s reload
```

### 4. 执行部署

在 Jenkins 中点击"立即构建"。

### 5. 访问应用

http://182.92.106.252/web

## 文件说明

- `Jenkinsfile` - Jenkins Pipeline 配置
- `vite.config.mts` - Vite 构建配置（已配置 base: '/web/'）
- `nginx/web-antd.conf` - Nginx 配置模板
- `部署.md` - 完整部署文档
- `build-local.sh` - 本地构建验证脚本
- `verify-nginx-config.sh` - Nginx 配置验证脚本

## 关键配置

### Vite Base 路径

```typescript
// vite.config.mts
base: process.env.NODE_ENV === 'production' ? '/web/' : '/';
```

### Nginx Location

```nginx
location /web {
    alias /usr/share/nginx/html/web;
    try_files $uri $uri/ /web/index.html;
}
```

### Jenkins 环境变量

```groovy
environment {
    DIST_DIR = 'dist'
    REMOTE_SERVER = 'nginx-server'
    DEPLOY_PATH = 'web'
    APP_DIR = 'apps/web-antd'
}
```

## 常见问题

### Q: 页面 404

A: 检查 Nginx 配置是否包含 `location /web`，并重新加载配置。

### Q: 静态资源 404

A: 检查 `vite.config.mts` 中的 base 配置是否为 `/web/`。

### Q: pnpm 未安装

A: Jenkinsfile 会自动安装，或手动执行 `npm install -g pnpm`。

### Q: 构建失败

A: 检查 TypeScript 错误或内存不足，可增加 Node 内存限制。

## 详细文档

请参考 `部署.md` 获取完整的部署步骤和故障排查指南。

## 对比

| 项目      | ruoyi-office-doc  | ruoyi-office-vben/web-antd |
| --------- | ----------------- | -------------------------- |
| 包管理器  | npm               | pnpm                       |
| 访问路径  | /ruoyi-office-doc | /web                       |
| Base 配置 | 不需要            | 需要 base: '/web/'         |

## 支持

如有问题，请查看：

1. Jenkins 构建日志
2. Nginx 错误日志
3. 部署文档故障排查部分
