#!/bin/bash

# 获取脚本所在的绝对路径
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID文件路径
PID_DIR="/tmp/novel-publication"
BACKEND_PID_FILE="$PID_DIR/backend-prod.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend-prod.pid"

# 日志文件路径
LOG_DIR="$PID_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend-prod.log"
FRONTEND_LOG="$LOG_DIR/frontend-prod.log"

# 创建必要的目录
mkdir -p "$PID_DIR" "$LOG_DIR"

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

# 检查服务是否运行
is_running() {
    local pid_file=$1
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$pid_file"
            return 1
        fi
    fi
    return 1
}

# 停止所有服务
stop_all() {
    echo -e "${BLUE}停止现有服务...${NC}"
    
    # 停止开发服务
    "$SCRIPT_PATH/start-all-lan.sh" stop 2>/dev/null || true
    
    # 停止生产服务
    if is_running "$BACKEND_PID_FILE"; then
        kill $(cat "$BACKEND_PID_FILE") 2>/dev/null || true
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if is_running "$FRONTEND_PID_FILE"; then
        kill $(cat "$FRONTEND_PID_FILE") 2>/dev/null || true
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # 清理可能的残留进程
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "vite.*preview" 2>/dev/null || true
    
    sleep 2
}

# 启动后端服务
start_backend() {
    echo -e "${BLUE}启动后端服务 (生产模式)...${NC}"
    cd "$SCRIPT_PATH/backend"
    
    # 创建虚拟环境（如果不存在）
    if [ ! -d "venv" ]; then
        echo "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境并安装依赖
    source venv/bin/activate
    pip install -q -r requirements.txt
    
    # 创建必要的目录
    mkdir -p data/novels data/backups uploads static
    
    # 设置生产环境变量并启动
    export PORT=8038
    export LOG_LEVEL=INFO
    
    # 使用nohup在后台启动，不使用reload模式
    nohup python -u main.py > "$BACKEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$BACKEND_PID_FILE"
    
    sleep 3
    
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "${GREEN}✅ 后端服务已启动 (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ 后端服务启动失败${NC}"
        return 1
    fi
}

# 启动前端服务
start_frontend() {
    echo -e "${BLUE}构建前端生产版本...${NC}"
    cd "$SCRIPT_PATH/frontend"
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        echo "安装前端依赖..."
        npm install
    fi
    
    # 构建生产版本（跳过TypeScript检查）
    echo "构建生产版本..."
    npx vite build
    
    echo -e "${BLUE}启动前端服务 (生产模式)...${NC}"
    
    # 使用preview命令启动生产服务器
    nohup npm run preview -- --host 0.0.0.0 --port 3838 > "$FRONTEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$FRONTEND_PID_FILE"
    
    sleep 5
    
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "${GREEN}✅ 前端服务已启动 (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ 前端服务启动失败${NC}"
        return 1
    fi
}

# 配置防火墙
configure_firewall() {
    echo -e "${BLUE}配置防火墙规则...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS 防火墙配置:"
        echo "  如果防火墙已启用，请运行以下命令（需要管理员权限）:"
        echo ""
        echo "  sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3"
        echo "  sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(which node)"
        echo "  sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/bin/python3"
        echo "  sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp $(which node)"
    else
        echo "Linux 防火墙配置:"
        echo "  请运行以下命令（需要管理员权限）:"
        echo ""
        echo "  # 对于 ufw:"
        echo "  sudo ufw allow 3838/tcp"
        echo "  sudo ufw allow 8038/tcp"
        echo ""
        echo "  # 对于 firewalld:"
        echo "  sudo firewall-cmd --permanent --add-port=3838/tcp"
        echo "  sudo firewall-cmd --permanent --add-port=8038/tcp"
        echo "  sudo firewall-cmd --reload"
    fi
    echo ""
}

# 显示访问信息
show_info() {
    local LAN_IP=$(get_lan_ip)
    
    echo ""
    echo "======================================="
    echo -e "${GREEN}   🚀 生产环境部署成功！${NC}"
    echo "======================================="
    echo ""
    echo "📌 访问地址:"
    echo ""
    echo "  本机访问:"
    echo "    前端界面: http://localhost:3838"
    echo "    后端API: http://localhost:8038"
    echo "    API文档: http://localhost:8038/docs"
    echo ""
    echo "  局域网访问 (其他设备):"
    echo "    前端界面: http://$LAN_IP:3838"
    echo "    后端API: http://$LAN_IP:8038"
    echo "    API文档: http://$LAN_IP:8038/docs"
    echo ""
    echo "📱 测试命令 (在其他机器上运行):"
    echo ""
    echo "  测试后端:"
    echo "    curl http://$LAN_IP:8038/api/novel/health"
    echo ""
    echo "  测试前端:"
    echo "    curl -I http://$LAN_IP:3838"
    echo ""
    echo "📄 日志文件:"
    echo "  后端: $BACKEND_LOG"
    echo "  前端: $FRONTEND_LOG"
    echo ""
    echo "🔧 管理命令:"
    echo "  查看日志: tail -f $BACKEND_LOG"
    echo "  停止服务: $0 stop"
    echo ""
}

# 停止服务
stop_services() {
    echo -e "${BLUE}停止生产服务...${NC}"
    
    if is_running "$BACKEND_PID_FILE"; then
        kill $(cat "$BACKEND_PID_FILE")
        rm -f "$BACKEND_PID_FILE"
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    else
        echo -e "${YELLOW}后端服务未运行${NC}"
    fi
    
    if is_running "$FRONTEND_PID_FILE"; then
        kill $(cat "$FRONTEND_PID_FILE")
        rm -f "$FRONTEND_PID_FILE"
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    else
        echo -e "${YELLOW}前端服务未运行${NC}"
    fi
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            echo "======================================="
            echo "   📚 小说发布系统 - 生产环境部署"
            echo "======================================="
            echo ""
            
            # 停止现有服务
            stop_all
            
            # 启动服务
            start_backend
            start_frontend
            
            # 配置防火墙提示
            configure_firewall
            
            # 显示信息
            show_info
            ;;
            
        stop)
            stop_services
            ;;
            
        restart)
            $0 stop
            sleep 2
            $0 start
            ;;
            
        *)
            echo "用法: $0 {start|stop|restart}"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"