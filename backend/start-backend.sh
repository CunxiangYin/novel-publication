#!/bin/bash

echo "======================================"
echo "   📚 后端服务启动脚本"
echo "======================================"

# 进入backend目录
cd "$(dirname "$0")"

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装，请先安装Python3"
    exit 1
fi

echo "✓ Python3已安装"

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "检查依赖..."
pip install -q -r requirements.txt

# 创建必要的目录
echo "创建必要的目录..."
mkdir -p data/novels data/backups uploads static

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  .env文件不存在"
    echo "创建默认配置..."
    cat > .env << EOF
# API Configuration
ANTHROPIC_API_KEY=

# Server Configuration
PORT=8038
LOG_LEVEL=INFO

# File Paths
NOVEL_DIR=./data/novels
BACKUP_DIR=./data/backups
UPLOAD_DIR=./uploads

# Publishing Configuration
PUBLISH_ENDPOINT=https://wxrd.alongmen.com/book/v1/uploadBookInfo
PUBLISH_SECRET=aiGenerateBook
EOF
    echo "✓ 已创建 .env 文件，请编辑添加您的 Anthropic API 密钥"
fi

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

# 启动服务
echo ""
echo "======================================"
echo "   启动FastAPI服务"
echo "======================================"
echo ""
echo "📌 访问地址:"
echo "   本地访问:"
echo "     Web界面: http://localhost:8038"
echo "     API文档: http://localhost:8038/docs"

if [ ! -z "$LAN_IP" ]; then
    echo ""
    echo "   局域网访问:"
    echo "     Web界面: http://$LAN_IP:8038"
    echo "     API文档: http://$LAN_IP:8038/docs"
fi

echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 使用环境变量启动（确保使用8038端口）
PORT=8038 python main.py