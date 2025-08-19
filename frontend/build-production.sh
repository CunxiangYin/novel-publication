#!/bin/bash

echo "========================================="
echo "   前端生产构建 (跳过类型检查)"
echo "========================================="
echo ""

# 构建不检查TypeScript错误
echo "开始构建..."
npx vite build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功！"
    echo ""
    echo "生产文件位于: dist/"
    echo ""
    echo "启动预览服务器:"
    echo "  npm run preview -- --host 0.0.0.0 --port 3838"
else
    echo ""
    echo "❌ 构建失败"
fi