# Nginx 配置统一规划方案

## 📋 配置文件说明

| 文件名                  | 说明                         | 状态        |
| ----------------------- | ---------------------------- | ----------- |
| `ruoyi-office.conf`     | **统一配置文件（推荐使用）** | ✅ 使用中   |
| `default.conf`          | Nginx原始默认配置            | ⚠️ 将被替换 |
| `ruoyi-office-doc.conf` | 旧的VitePress文档配置        | ⚠️ 将被替换 |
| `web-antd.conf`         | 旧的Vben配置（语法错误）     | ❌ 将被删除 |

## 🎯 统一规划架构

### 单一 Server 块方案

采用 **一个 server 块统一管理所有项目**，通过不同路径访问：

```
http://182.92.106.252
├── /               → VitePress 文档站点
└── /web            → Vben Admin 管理后台
```

### 目录映射

```
/usr/share/nginx/html/
├── ruoyi-office-doc/    → http://182.92.106.252/
└── web/                 → http://182.92.106.252/web
```

## 🔧 配置特性

### 1. VitePress 文档站点（根路径）

- **访问路径**: `http://182.92.106.252/`
- **物理路径**: `/usr/share/nginx/html/ruoyi-office-doc`
- **特性**:
  - SPA 路由支持
  - 静态资源缓存（30天）
  - Gzip 压缩

### 2. Vben Admin 管理后台（子路径）

- **访问路径**: `http://182.92.106.252/web`
- **物理路径**: `/usr/share/nginx/html/web`
- **特性**:
  - 使用 `alias` 指令去掉 `/web` 前缀
  - SPA 路由支持
  - 静态资源缓存（30天）
  - Gzip 压缩

### 3. 全局特性

- ✅ 字符集：UTF-8
- ✅ Gzip 压缩：已启用
- ✅ 静态资源缓存：30天
- ✅ 隐藏文件保护
- ✅ 健康检查接口：`/health`
- ✅ 错误页面处理

## 📦 快速部署

### 方式1：使用自动化脚本（推荐）

```bash
# 进入配置目录
cd w:/ruoyi-office/ruoyi-office-vben/apps/web-antd/nginx

# 给脚本添加执行权限
chmod +x deploy-nginx-config.sh

# 执行部署
./deploy-nginx-config.sh
```

### 方式2：手动部署

#### 步骤1：备份现有配置

```bash
ssh root@182.92.106.252 << 'EOF'
BACKUP_DIR="/data/nginx/conf/conf.d/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p ${BACKUP_DIR}
cp -r /data/nginx/conf/conf.d/*.conf ${BACKUP_DIR}/ 2>/dev/null || true
echo "备份完成: ${BACKUP_DIR}"
EOF
```

#### 步骤2：上传新配置

```bash
scp ruoyi-office.conf root@182.92.106.252:/data/nginx/conf/conf.d/
```

#### 步骤3：删除旧配置文件

```bash
ssh root@182.92.106.252 << 'EOF'
cd /data/nginx/conf/conf.d
rm -f default.conf ruoyi-office-doc.conf web-antd.conf
echo "已删除旧配置文件"
EOF
```

#### 步骤4：验证配置

```bash
ssh root@182.92.106.252 "docker exec nginx nginx -t"
```

#### 步骤5：重新加载 Nginx

```bash
ssh root@182.92.106.252 "docker exec nginx nginx -s reload"
```

#### 步骤6：验证部署

```bash
# 检查文档站点
curl -I http://182.92.106.252/

# 检查管理后台
curl -I http://182.92.106.252/web

# 检查健康状态
curl http://182.92.106.252/health
```

## 🔍 验证部署结果

### 1. 测试访问

```bash
# 测试文档站点
curl -I http://182.92.106.252/
# 期望: HTTP/1.1 200 OK

# 测试管理后台
curl -I http://182.92.106.252/web
# 期望: HTTP/1.1 200 OK

# 测试健康检查
curl http://182.92.106.252/health
# 期望: healthy
```

### 2. 查看配置

```bash
# 查看当前配置
ssh root@182.92.106.252 'cat /data/nginx/conf/conf.d/ruoyi-office.conf'

# 查看配置文件列表
ssh root@182.92.106.252 'ls -lh /data/nginx/conf/conf.d/'
```

### 3. 查看日志

```bash
# 查看访问日志
ssh root@182.92.106.252 'docker exec nginx tail -f /var/log/nginx/ruoyi-office-access.log'

# 查看错误日志
ssh root@182.92.106.252 'docker exec nginx tail -f /var/log/nginx/ruoyi-office-error.log'
```

## 🔙 回滚方案

如果部署后出现问题，可以快速回滚：

```bash
# 查看备份目录
ssh root@182.92.106.252 'ls -lh /data/nginx/conf/conf.d/backup-*'

# 回滚到指定备份（替换时间戳）
ssh root@182.92.106.252 << 'EOF'
BACKUP_DIR="/data/nginx/conf/conf.d/backup-20260121-153000"  # 替换为实际备份目录
rm -f /data/nginx/conf/conf.d/ruoyi-office.conf
cp ${BACKUP_DIR}/*.conf /data/nginx/conf/conf.d/
docker exec nginx nginx -t && docker exec nginx nginx -s reload
echo "回滚完成"
EOF
```

## 🛠️ 常见问题

### 1. 为什么采用单一 server 块？

**优点**:

- ✅ 配置统一，易于管理
- ✅ 避免端口冲突
- ✅ 通过路径隔离不同项目
- ✅ 便于添加新项目

**缺点**:

- ⚠️ 所有项目共享同一个 server 配置
- ⚠️ 不能为不同项目设置不同的域名

### 2. 如果需要独立域名怎么办？

如果需要为不同项目配置独立域名，可以创建多个 server 块：

```nginx
# 文档站点
server {
    listen 80;
    server_name doc.example.com;
    root /usr/share/nginx/html/ruoyi-office-doc;
    # ...
}

# 管理后台
server {
    listen 80;
    server_name admin.example.com;
    root /usr/share/nginx/html/web;
    # ...
}
```

### 3. 如何添加新项目？

在 `ruoyi-office.conf` 中添加新的 `location` 块：

```nginx
location /new-project {
    alias /usr/share/nginx/html/new-project;
    index index.html;
    try_files $uri $uri/ /new-project/index.html;
}
```

### 4. 如何启用 HTTPS？

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... 其他配置
}

server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

## 📚 相关文档

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [VitePress 部署指南](../docs/部署.md)
- [Vben Admin 部署文档](https://doc.vben.pro/guide/deploy.html)

## 📞 技术支持

如有问题，请查看：

- Nginx 错误日志：`/var/log/nginx/ruoyi-office-error.log`
- Nginx 访问日志：`/var/log/nginx/ruoyi-office-access.log`
- Docker 容器日志：`docker logs nginx`
