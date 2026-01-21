#!/bin/bash
# 本地构建验证脚本
# 用于在本地验证构建配置是否正确

set -e

echo "=========================================="
echo "Vben Admin 本地构建验证"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在 apps/web-antd 目录下执行此脚本"
    exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: pnpm 未安装"
    echo "请执行: npm install -g pnpm"
    exit 1
fi

echo "✓ 当前目录: $(pwd)"
echo "✓ pnpm 版本: $(pnpm -v)"
echo ""

# 返回到项目根目录
cd ../..
echo "1. 切换到项目根目录: $(pwd)"
echo ""

# 安装依赖
echo "2. 安装依赖..."
pnpm install --frozen-lockfile
echo "✓ 依赖安装完成"
echo ""

# 返回到 web-antd 目录
cd apps/web-antd
echo "3. 切换回应用目录: $(pwd)"
echo ""

# 执行构建
echo "4. 开始构建..."
export NODE_ENV=production
pnpm build

# 检查构建产物
echo ""
echo "5. 检查构建产物..."
if [ -d "dist" ]; then
    echo "✓ 构建成功！"
    echo ""
    echo "产物目录: dist/"
    echo "产物大小: $(du -sh dist | cut -f1)"
    echo ""
    echo "主要文件:"
    ls -lh dist/ | head -n 10
    echo ""
    echo "静态资源:"
    ls -lh dist/assets/ | head -n 5
else
    echo "❌ 构建失败: dist 目录不存在"
    exit 1
fi

echo ""
echo "=========================================="
echo "构建验证完成！"
echo "=========================================="
echo ""
echo "下一步:"
echo "  1. 检查 dist/index.html 中的资源路径是否包含 /web/ 前缀"
echo "  2. 使用 'pnpm preview' 本地预览构建产物"
echo "  3. 提交代码并触发 Jenkins 构建"
echo ""
echo "本地预览命令:"
echo "  pnpm preview"
echo ""
