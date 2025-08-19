#!/bin/bash

echo "======================================"
echo "   📚 小说发布系统 - 启动脚本"
echo "======================================"

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装，请先安装Python3"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

echo "✓ 环境检查通过"
echo ""

# 启动后端服务
echo "正在启动后端服务..."
cd backend
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

# 后台启动后端
python main.py &
BACKEND_PID=$!
echo "✓ 后端服务已启动 (PID: $BACKEND_PID)"
echo "  访问地址: http://localhost:8000"
echo ""

# 启动前端服务
echo "正在启动前端服务..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

echo ""
echo "======================================"
echo "   系统启动成功！"
echo "======================================"
echo ""
echo "📌 访问地址:"
echo "   前端界面: http://localhost:3000"
echo "   后端API: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 前台启动前端（这样Ctrl+C可以同时停止两个服务）
npm run dev

# 清理
kill $BACKEND_PID 2>/dev/null
echo "服务已停止"