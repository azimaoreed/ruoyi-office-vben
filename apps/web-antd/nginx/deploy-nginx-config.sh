#!/bin/bash

# ========================================
# Nginx 配置部署脚本
# ========================================
# 用途：部署统一的 Nginx 配置文件
# 服务器：182.92.106.252
# ========================================

set -e

REMOTE_HOST="182.92.106.252"
NGINX_CONF_DIR="/data/nginx/conf/conf.d"
BACKUP_DIR="/data/nginx/conf/conf.d/backup-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "🚀 开始部署 Nginx 配置"
echo "=========================================="

# 1. 备份现有配置
echo ""
echo "📦 1. 备份现有配置..."
ssh root@${REMOTE_HOST} "mkdir -p ${BACKUP_DIR} && cp -r ${NGINX_CONF_DIR}/*.conf ${BACKUP_DIR}/ 2>/dev/null || true"
echo "✓ 备份完成: ${BACKUP_DIR}"

# 2. 上传新配置
echo ""
echo "📤 2. 上传新配置文件..."
scp ruoyi-office.conf root@${REMOTE_HOST}:${NGINX_CONF_DIR}/

# 3. 删除旧配置文件
echo ""
echo "🗑️  3. 删除旧配置文件..."
ssh root@${REMOTE_HOST} "cd ${NGINX_CONF_DIR} && rm -f default.conf ruoyi-office-doc.conf web-antd.conf"
echo "✓ 已删除: default.conf, ruoyi-office-doc.conf, web-antd.conf"

# 4. 验证配置
echo ""
echo "🔍 4. 验证 Nginx 配置..."
if ssh root@${REMOTE_HOST} "docker exec nginx nginx -t"; then
    echo "✓ 配置验证成功"
else
    echo "✗ 配置验证失败，正在恢复备份..."
    ssh root@${REMOTE_HOST} "rm -f ${NGINX_CONF_DIR}/ruoyi-office.conf && cp ${BACKUP_DIR}/*.conf ${NGINX_CONF_DIR}/"
    echo "✓ 已恢复备份"
    exit 1
fi

# 5. 重新加载 Nginx
echo ""
echo "🔄 5. 重新加载 Nginx..."
ssh root@${REMOTE_HOST} "docker exec nginx nginx -s reload"
echo "✓ Nginx 重新加载成功"

# 6. 验证部署结果
echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📋 部署信息："
echo "  - 配置文件: ${NGINX_CONF_DIR}/ruoyi-office.conf"
echo "  - 备份目录: ${BACKUP_DIR}"
echo ""
echo "🌐 访问地址："
echo "  - VitePress文档: http://182.92.106.252/"
echo "  - Vben Admin:   http://182.92.106.252/web"
echo ""
echo "🔍 验证部署："
echo "  curl -I http://182.92.106.252/"
echo "  curl -I http://182.92.106.252/web"
echo "  curl http://182.92.106.252/health"
echo ""
echo "📝 查看配置："
echo "  ssh root@${REMOTE_HOST} 'cat ${NGINX_CONF_DIR}/ruoyi-office.conf'"
echo ""
echo "🔙 如需回滚："
echo "  ssh root@${REMOTE_HOST} 'rm -f ${NGINX_CONF_DIR}/ruoyi-office.conf && cp ${BACKUP_DIR}/*.conf ${NGINX_CONF_DIR}/ && docker exec nginx nginx -s reload'"
echo ""
