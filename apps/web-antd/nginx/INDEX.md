# Nginx 配置文档索引

## 📚 文档导航

### 🚀 快速开始

1. **[快速部署指南](快速部署指南.md)** ⭐ 推荐
   - 一键部署脚本
   - 快速检查清单
   - 常见问题解决

### 📖 详细文档

2. **[README.md](README.md)** - 完整配置说明
   - 配置文件说明
   - 统一规划架构
   - 手动部署步骤
   - 验证和回滚方案

3. **[配置对比.md](配置对比.md)** - 新旧配置对比
   - 配置文件对比
   - 主要改进说明
   - 性能对比分析
   - 迁移建议

### 🛠️ 配置文件

#### ✅ 使用中的配置

- **[ruoyi-office.conf](ruoyi-office.conf)** - 统一配置文件（推荐使用）
  - 包含 VitePress 文档站点配置
  - 包含 Vben Admin 管理后台配置
  - 完整的性能优化

#### ⚠️ 已弃用的配置

- **[default.conf](default.conf)** - Nginx 原始默认配置（已弃用）
- **[ruoyi-office-doc.conf](ruoyi-office-doc.conf)** - VitePress 旧配置（已弃用）
- **[web-antd.conf](web-antd.conf)** - Vben 旧配置（有语法错误，已弃用）

### 🔧 工具脚本

- **[deploy-nginx-config.sh](deploy-nginx-config.sh)** - 自动化部署脚本
  - 自动备份现有配置
  - 上传并应用新配置
  - 验证配置正确性
  - 一键完成部署

## 🎯 根据需求查找文档

### 我想要...

#### 快速部署

👉 **[快速部署指南](快速部署指南.md)**

- 一键部署命令
- 部署前后检查清单
- 快速验证方法

#### 了解配置详情

👉 **[README.md](README.md)**

- 统一配置方案介绍
- 详细的配置特性
- 手动部署步骤

#### 了解改进内容

👉 **[配置对比.md](配置对比.md)**

- 新旧配置对比
- 性能改进说明
- 语法错误修复

#### 解决部署问题

👉 **[快速部署指南 - 故障排查](快速部署指南.md#故障排查)**

- 常见问题和解决方案
- 日志查看方法
- 回滚步骤

#### 查看完整部署流程

👉 **[../docs/部署.md](../docs/部署.md)**

- Jenkins Pipeline 配置
- Vite 配置说明
- 完整的部署流程

## 📋 快速参考

### 访问地址

| 项目 | URL | 物理路径 |
| --- | --- | --- |
| VitePress 文档 | http://182.92.106.252/ | `/usr/share/nginx/html/ruoyi-office-doc` |
| Vben Admin | http://182.92.106.252/web | `/usr/share/nginx/html/web` |
| 健康检查 | http://182.92.106.252/health | N/A |

### 常用命令

```bash
# 一键部署
./deploy-nginx-config.sh

# 验证配置
ssh root@182.92.106.252 'docker exec nginx nginx -t'

# 重新加载
ssh root@182.92.106.252 'docker exec nginx nginx -s reload'

# 查看日志
ssh root@182.92.106.252 'docker exec nginx tail -f /var/log/nginx/ruoyi-office-access.log'
```

### 配置文件位置

- **服务器配置文件**: `/data/nginx/conf/conf.d/ruoyi-office.conf`
- **本地配置文件**: `w:/ruoyi-office/ruoyi-office-vben/apps/web-antd/nginx/ruoyi-office.conf`
- **备份目录**: `/data/nginx/conf/conf.d/backup-YYYYMMDD-HHMMSS/`

## 🔄 配置更新流程

1. **编辑配置文件**

   ```bash
   # 编辑本地配置
   vi w:/ruoyi-office/ruoyi-office-vben/apps/web-antd/nginx/ruoyi-office.conf
   ```

2. **测试配置语法**

   ```bash
   # 上传到服务器临时位置
   scp ruoyi-office.conf root@182.92.106.252:/tmp/

   # 测试配置
   ssh root@182.92.106.252 'docker exec nginx nginx -t -c /tmp/ruoyi-office.conf'
   ```

3. **部署配置**

   ```bash
   # 使用自动化脚本部署
   ./deploy-nginx-config.sh
   ```

4. **验证部署**
   ```bash
   # 访问测试
   curl -I http://182.92.106.252/
   curl -I http://182.92.106.252/web
   ```

## 📞 获取帮助

### 文档内查找

1. 先查看 **[快速部署指南](快速部署指南.md)** 的故障排查部分
2. 再查看 **[README.md](README.md)** 的常见问题部分
3. 查看 **[配置对比.md](配置对比.md)** 了解配置变更

### 检查日志

```bash
# Nginx 错误日志
ssh root@182.92.106.252 'docker exec nginx tail -100 /var/log/nginx/ruoyi-office-error.log'

# Nginx 访问日志
ssh root@182.92.106.252 'docker exec nginx tail -100 /var/log/nginx/ruoyi-office-access.log'

# Docker 容器日志
ssh root@182.92.106.252 'docker logs nginx'
```

### 验证配置

```bash
# 测试 Nginx 配置语法
ssh root@182.92.106.252 'docker exec nginx nginx -t'

# 查看当前配置
ssh root@182.92.106.252 'cat /data/nginx/conf/conf.d/ruoyi-office.conf'
```

## 🎓 学习资源

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Nginx location 指令详解](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
- [Nginx alias vs root](https://nginx.org/en/docs/http/ngx_http_core_module.html#alias)
- [Vite 配置文档](https://vitejs.dev/config/)

## 📝 版本历史

| 版本 | 日期       | 变更说明                                  |
| ---- | ---------- | ----------------------------------------- |
| v2.0 | 2026-01-21 | 统一配置方案，修复 web-antd.conf 语法错误 |
| v1.0 | 2026-01-20 | 初始版本，独立配置文件                    |

## ✅ 配置检查清单

### 部署前

- [ ] 已阅读 [快速部署指南](快速部署指南.md)
- [ ] 已备份现有配置
- [ ] 已确认 SSH 访问正常
- [ ] 已确认 Nginx 容器运行正常

### 部署后

- [ ] 配置语法验证通过 (`nginx -t`)
- [ ] Nginx 重新加载成功
- [ ] http://182.92.106.252/ 可以访问
- [ ] http://182.92.106.252/web 可以访问
- [ ] 静态资源加载正常
- [ ] Gzip 压缩已启用
- [ ] 缓存策略生效

---

**提示**: 建议从 **[快速部署指南](快速部署指南.md)** 开始 🚀
