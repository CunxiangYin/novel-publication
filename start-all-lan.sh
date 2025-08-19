#!/bin/bash

echo "======================================"
echo "   📚 小说发布系统 - 局域网启动脚本"
echo "======================================"

# 获取本机IP地址
get_lan_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
    else
        # Linux
        hostname -I | awk '{print $1}'
    fi
}

LAN_IP=$(get_lan_ip)

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

# 创建必要的目录
mkdir -p data/novels data/backups uploads static

# 后台启动后端（监听所有网络接口）
python main.py &
BACKEND_PID=$!
echo "✓ 后端服务已启动 (PID: $BACKEND_PID)"
echo ""

# 等待后端启动
sleep 3

# 启动前端服务
echo "正在启动前端服务..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

echo ""
echo "======================================"
echo "   🚀 系统启动成功！"
echo "======================================"
echo ""
echo "📌 访问地址:"
echo ""
echo "  本地访问:"
echo "    前端界面: http://localhost:3838"
echo "    后端API: http://localhost:8038"
echo "    API文档: http://localhost:8038/docs"
echo ""

if [ ! -z "$LAN_IP" ]; then
    echo "  局域网访问 (其他设备可用):"
    echo "    前端界面: http://$LAN_IP:3838"
    echo "    后端API: http://$LAN_IP:8038"
    echo "    API文档: http://$LAN_IP:8038/docs"
    echo ""
    echo "  📱 手机扫码访问:"
    echo "    请使用手机浏览器访问: http://$LAN_IP:3838"
else
    echo "  ⚠️  无法获取局域网IP地址"
fi

echo ""
echo "======================================"
echo "  防火墙配置提醒:"
echo "  如果无法从其他设备访问，请检查防火墙设置:"
echo ""
echo "  macOS:"
echo "    系统偏好设置 > 安全性与隐私 > 防火墙"
echo ""
echo "  Windows:"
echo "    Windows防火墙 > 允许应用 > 添加Python和Node"
echo ""
echo "  Linux:"
echo "    sudo ufw allow 3838"
echo "    sudo ufw allow 8038"
echo "======================================"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 前台启动前端（这样Ctrl+C可以同时停止两个服务）
npm run dev -- --host

# 清理
kill $BACKEND_PID 2>/dev/null
echo "服务已停止"