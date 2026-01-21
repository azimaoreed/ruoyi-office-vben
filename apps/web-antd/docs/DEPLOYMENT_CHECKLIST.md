# Vben Admin 部署操作清单

## 部署前检查清单

### Jenkins 服务器(140)

- [ ] Jenkins 容器正常运行
- [ ] NodeJS Plugin 已安装
- [ ] Publish Over SSH Plugin 已安装
- [ ] Node.js 工具已配置（名称：node20）
- [ ] pnpm 已安装或 Jenkinsfile 会自动安装
- [ ] SSH 服务器配置已添加（nginx-server）
- [ ] 可以访问 Git 仓库

### Nginx 服务器(182.92.106.252)

- [ ] Nginx 容器正常运行
- [ ] 部署目录已创建：`/data/nginx/html/web`
- [ ] 目录权限正确：`chmod 755 /data/nginx/html/web`
- [ ] Nginx 配置已添加 `location /web`
- [ ] Nginx 配置语法验证通过：`docker exec nginx nginx -t`
- [ ] SSH 连接正常（Jenkins 可以连接）

### 代码仓库

- [ ] `vite.config.mts` 已配置 `base: '/web/'`
- [ ] `Jenkinsfile` 已提交到仓库
- [ ] Git 凭据已配置（如需要）

## 部署步骤

### 第一步：准备 Jenkins 环境

```bash
# 在 Jenkins 服务器(140)上执行

# 1. 进入 Jenkins 容器
docker exec -it jenkins bash

# 2. 安装 pnpm（如未安装）
npm install -g pnpm@latest

# 3. 验证
pnpm -v

# 4. 退出容器
exit
```

**检查点**: ✅ pnpm 版本显示正常

---

### 第二步：配置 Nginx

```bash
# 在 Nginx 服务器(182.92.106.252)上执行

# 1. 创建部署目录
mkdir -p /data/nginx/html/web
chmod 755 /data/nginx/html/web

# 2. 编辑 Nginx 配置文件
# 方式A：编辑主配置文件
vi /data/nginx/conf/conf.d/default.conf

# 方式B：创建独立配置文件
vi /data/nginx/conf/conf.d/web-antd.conf

# 3. 添加以下配置（参考 nginx/web-antd.conf）
# location /web {
#     alias /usr/share/nginx/html/web;
#     index index.html;
#     try_files $uri $uri/ /web/index.html;
#     ...
# }

# 4. 验证配置
docker exec nginx nginx -t

# 5. 重新加载配置
docker exec nginx nginx -s reload
```

**检查点**: 
- ✅ 配置语法验证通过
- ✅ Nginx 重新加载成功

---

### 第三步：创建 Jenkins Pipeline 任务

1. 登录 Jenkins Web 界面：http://140:8080

2. 点击 `新建任务`

3. 配置任务：
   - **任务名称**: `ruoyi-office-vben-web-antd-deploy`
   - **类型**: 流水线 (Pipeline)

4. Pipeline 配置：
   - **定义**: Pipeline script from SCM
   - **SCM**: Git
   - **仓库 URL**: `git@codeup.aliyun.com:676b69e335730943ed494c52/ruoyi-office/ruoyi-office-vben.git`
   - **分支**: `*/main` 或 `*/master`
   - **脚本路径**: `apps/web-antd/Jenkinsfile`

5. 点击 `保存`

**检查点**: ✅ Jenkins 任务创建成功

---

### 第四步：执行首次部署

1. 在 Jenkins 任务页面，点击 `立即构建`

2. 查看构建日志，确认各阶段成功：
   - ✅ 1. 拉取代码
   - ✅ 2. 环境检查
   - ✅ 3. 安装依赖
   - ✅ 4. 构建应用
   - ✅ 5. 部署到 Nginx
   - ✅ 6. 验证部署

3. 等待构建完成（预计 3-5 分钟）

**检查点**: ✅ 构建状态显示成功（绿色）

---

### 第五步：验证部署

```bash
# 在 Nginx 服务器(182.92.106.252)上执行

# 1. 检查文件是否存在
ls -la /data/nginx/html/web/
# 应该看到 index.html、assets/ 等文件

# 2. 检查文件数量
find /data/nginx/html/web/ -type f | wc -l
# 应该有多个文件

# 3. 检查 index.html 内容
head -n 20 /data/nginx/html/web/index.html
# 应该看到 HTML 内容和 /web/ 路径

# 4. 测试访问
curl -I http://localhost/web/
# 应该返回 HTTP/1.1 200 OK
```

**检查点**: 
- ✅ 文件已传输到服务器
- ✅ index.html 存在
- ✅ 本地访问返回 200

---

### 第六步：浏览器访问验证

1. 打开浏览器

2. 访问：http://182.92.106.252/web

3. 验证：
   - ✅ 页面正常显示（Vben Admin 登录页面）
   - ✅ 样式正常加载（无样式错乱）
   - ✅ 静态资源正常（无 404 错误）
   - ✅ 控制台无错误（F12 查看）

**检查点**: ✅ 应用可以正常访问和使用

---

## 部署后验证清单

### 功能验证

- [ ] 登录页面显示正常
- [ ] 可以输入用户名密码
- [ ] 图片/图标正常显示
- [ ] CSS 样式正常加载
- [ ] JavaScript 正常执行
- [ ] 路由跳转正常工作
- [ ] API 请求正常（如已配置后端）

### 性能验证

- [ ] 首屏加载时间 < 3 秒
- [ ] 静态资源缓存生效（查看 Response Headers）
- [ ] Gzip 压缩生效（查看 Content-Encoding）

### 日志检查

```bash
# Nginx 访问日志
docker exec nginx tail -f /var/log/nginx/access.log

# Nginx 错误日志
docker exec nginx tail -f /var/log/nginx/error.log

# Jenkins 构建日志
# 在 Jenkins Web 界面查看
```

---

## 常见问题快速修复

### 问题1: 页面 404

```bash
# 检查 Nginx 配置
docker exec nginx nginx -T | grep -A 10 "location /web"

# 如果没有配置，添加后重新加载
docker exec nginx nginx -s reload
```

### 问题2: 静态资源 404

```bash
# 检查 base 路径配置
grep "base:" apps/web-antd/vite.config.mts

# 应该显示: base: process.env.NODE_ENV === 'production' ? '/web/' : '/'
```

### 问题3: 文件未传输

```bash
# 检查 Jenkins 日志中的传输信息
# 查看是否有 "SSH: Transferred X file(s)" 消息

# 检查 SSH 连接
# Jenkins 系统配置 -> Publish over SSH -> Test Configuration
```

### 问题4: pnpm 未安装

```bash
# 进入 Jenkins 容器安装
docker exec -it jenkins bash
npm install -g pnpm@latest
exit
```

---

## 回滚操作

如果部署出现问题，可以快速回滚：

```bash
# 在 Nginx 服务器上执行

# 1. 备份当前版本（如有）
mv /data/nginx/html/web /data/nginx/html/web.backup.$(date +%Y%m%d_%H%M%S)

# 2. 恢复上一个版本
mv /data/nginx/html/web.backup.YYYYMMDD_HHMMSS /data/nginx/html/web

# 3. 重新加载 Nginx
docker exec nginx nginx -s reload
```

---

## 后续维护

### 自动部署

配置 Git Webhook 实现代码推送自动部署：

1. Git 仓库设置 -> Webhooks
2. URL: `http://140:8080/github-webhook/`
3. 触发事件: Push events
4. 分支: main/master

### 监控

建议配置以下监控：

- [ ] Jenkins 构建通知（邮件/企业微信）
- [ ] Nginx 访问日志监控
- [ ] 应用性能监控（APM）
- [ ] 错误日志告警

### 定期检查

- [ ] 每周检查 Jenkins 构建历史
- [ ] 每月检查 Nginx 日志
- [ ] 定期更新依赖版本
- [ ] 定期备份配置文件

---

## 联系支持

如遇到问题，请查看：

1. **部署文档**: `部署.md`
2. **Jenkins 日志**: Jenkins Web 界面 -> 构建历史 -> Console Output
3. **Nginx 日志**: `docker exec nginx tail -f /var/log/nginx/error.log`
4. **快速指南**: `README_DEPLOY.md`

---

## 部署成功标志

✅ 所有检查项通过
✅ 浏览器可以访问 http://182.92.106.252/web
✅ 页面显示正常，无错误
✅ Jenkins 构建历史显示成功（绿色）

**恭喜！部署成功！** 🎉
