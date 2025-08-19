#!/bin/bash

echo "======================================"
echo "   小说发布系统启动脚本"
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
echo "安装依赖包..."
pip install -q -r requirements.txt

# 创建必要的目录
echo "创建必要的目录..."
mkdir -p data/novels data/backups uploads static

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  .env文件不存在，使用默认配置"
    echo "   请编辑.env文件配置您的Anthropic API密钥"
fi

# 启动服务
echo ""
echo "======================================"
echo "   启动FastAPI服务"
echo "======================================"
echo ""
echo "📌 访问地址:"
echo "   Web界面: http://localhost:8038"
echo "   API文档: http://localhost:8038/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动FastAPI
python main.py