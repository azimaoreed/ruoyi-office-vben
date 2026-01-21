#!/bin/bash
# Nginx 配置验证脚本
# 在 Nginx 服务器(182.92.106.252)上执行

set -e

NGINX_CONTAINER="nginx"
WEB_DIR="/data/nginx/html/web"
NGINX_CONF_DIR="/data/nginx/conf/conf.d"

echo "=========================================="
echo "Nginx 配置验证"
echo "=========================================="
echo ""

# 1. 检查部署目录
echo "1. 检查部署目录..."
if [ -d "${WEB_DIR}" ]; then
    echo "✓ 部署目录存在: ${WEB_DIR}"
    FILE_COUNT=$(ls -1 ${WEB_DIR} 2>/dev/null | wc -l)
    echo "  文件数量: ${FILE_COUNT}"
    
    if [ -f "${WEB_DIR}/index.html" ]; then
        echo "✓ index.html 存在"
    else
        echo "⚠ index.html 不存在，可能尚未部署"
    fi
else
    echo "❌ 部署目录不存在: ${WEB_DIR}"
    echo "创建目录..."
    mkdir -p ${WEB_DIR}
    chmod 755 ${WEB_DIR}
    echo "✓ 目录已创建"
fi

echo ""

# 2. 检查 Nginx 配置
echo "2. 检查 Nginx 配置..."
if docker exec ${NGINX_CONTAINER} nginx -T 2>/dev/null | grep -q "location /web"; then
    echo "✓ Nginx 配置包含 location /web"
    echo ""
    echo "配置详情:"
    docker exec ${NGINX_CONTAINER} nginx -T 2>/dev/null | grep -A 10 "location /web"
else
    echo "⚠ Nginx 配置中未找到 location /web"
    echo ""
    echo "请添加以下配置到 Nginx 配置文件:"
    echo ""
    cat nginx/web-antd.conf
fi

echo ""

# 3. 验证 Nginx 配置语法
echo "3. 验证 Nginx 配置语法..."
if docker exec ${NGINX_CONTAINER} nginx -t > /dev/null 2>&1; then
    echo "✓ Nginx 配置语法正确"
else
    echo "❌ Nginx 配置语法错误:"
    docker exec ${NGINX_CONTAINER} nginx -t
    exit 1
fi

echo ""

# 4. 检查 Nginx 容器状态
echo "4. 检查 Nginx 容器状态..."
if docker ps | grep -q ${NGINX_CONTAINER}; then
    echo "✓ Nginx 容器正在运行"
else
    echo "❌ Nginx 容器未运行"
    exit 1
fi

echo ""

# 5. 测试访问
echo "5. 测试访问..."
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/web/ || echo "000")
    if [ "${HTTP_CODE}" = "200" ]; then
        echo "✓ 访问测试成功 (HTTP ${HTTP_CODE})"
    elif [ "${HTTP_CODE}" = "404" ]; then
        echo "⚠ 访问返回 404，可能文件尚未部署"
    else
        echo "⚠ 访问返回 HTTP ${HTTP_CODE}"
    fi
else
    echo "⚠ curl 未安装，跳过访问测试"
fi

echo ""
echo "=========================================="
echo "验证完成！"
echo "=========================================="
echo ""
echo "访问地址: http://182.92.106.252/web"
echo ""
echo "如果页面无法访问，请检查:"
echo "  1. Nginx 配置是否包含 location /web"
echo "  2. 部署目录是否有文件"
echo "  3. Nginx 是否已重新加载配置"
echo ""
echo "重新加载 Nginx 配置:"
echo "  docker exec ${NGINX_CONTAINER} nginx -s reload"
echo ""
