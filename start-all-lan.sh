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
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"

# 日志文件路径
LOG_DIR="$PID_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

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
            # PID文件存在但进程不存在，清理PID文件
            rm -f "$pid_file"
            return 1
        fi
    fi
    return 1
}

# 启动后端服务
start_backend() {
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "${YELLOW}⚠️  后端服务已在运行 (PID: $(cat $BACKEND_PID_FILE))${NC}"
        return 0
    fi
    
    echo -e "${BLUE}正在启动后端服务...${NC}"
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
    
    # 后台启动后端
    nohup env PORT=8038 python main.py > "$BACKEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$BACKEND_PID_FILE"
    
    # 等待服务启动
    sleep 3
    
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "${GREEN}✅ 后端服务已启动 (PID: $pid)${NC}"
        echo -e "   日志文件: $BACKEND_LOG"
        return 0
    else
        echo -e "${RED}❌ 后端服务启动失败${NC}"
        echo -e "   请查看日志: $BACKEND_LOG"
        return 1
    fi
}

# 启动前端服务
start_frontend() {
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "${YELLOW}⚠️  前端服务已在运行 (PID: $(cat $FRONTEND_PID_FILE))${NC}"
        return 0
    fi
    
    echo -e "${BLUE}正在启动前端服务...${NC}"
    cd "$SCRIPT_PATH/frontend"
    
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo "安装前端依赖..."
        npm install
    fi
    
    # 后台启动前端
    nohup npm run dev -- --host > "$FRONTEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$FRONTEND_PID_FILE"
    
    # 等待服务启动
    sleep 5
    
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "${GREEN}✅ 前端服务已启动 (PID: $pid)${NC}"
        echo -e "   日志文件: $FRONTEND_LOG"
        return 0
    else
        echo -e "${RED}❌ 前端服务启动失败${NC}"
        echo -e "   请查看日志: $FRONTEND_LOG"
        return 1
    fi
}

# 停止后端服务
stop_backend() {
    if is_running "$BACKEND_PID_FILE"; then
        local pid=$(cat "$BACKEND_PID_FILE")
        echo -e "${BLUE}正在停止后端服务 (PID: $pid)...${NC}"
        kill $pid 2>/dev/null
        
        # 等待进程结束
        local count=0
        while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # 如果还在运行，强制结束
        if ps -p $pid > /dev/null 2>&1; then
            kill -9 $pid 2>/dev/null
        fi
        
        rm -f "$BACKEND_PID_FILE"
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
    fi
}

# 停止前端服务
stop_frontend() {
    if is_running "$FRONTEND_PID_FILE"; then
        local pid=$(cat "$FRONTEND_PID_FILE")
        echo -e "${BLUE}正在停止前端服务 (PID: $pid)...${NC}"
        
        # 杀死进程组（包括npm和vite）
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            pkill -P $pid 2>/dev/null
        else
            # Linux
            kill -- -$(ps -o pgid= $pid | grep -o '[0-9]*') 2>/dev/null
        fi
        kill $pid 2>/dev/null
        
        rm -f "$FRONTEND_PID_FILE"
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  前端服务未运行${NC}"
    fi
}

# 显示服务状态
show_status() {
    echo "======================================"
    echo "   📊 服务状态"
    echo "======================================"
    echo ""
    
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "${GREEN}✅ 后端服务运行中${NC} (PID: $(cat $BACKEND_PID_FILE))"
    else
        echo -e "${RED}❌ 后端服务未运行${NC}"
    fi
    
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "${GREEN}✅ 前端服务运行中${NC} (PID: $(cat $FRONTEND_PID_FILE))"
    else
        echo -e "${RED}❌ 前端服务未运行${NC}"
    fi
    
    echo ""
    
    local LAN_IP=$(get_lan_ip)
    if (is_running "$BACKEND_PID_FILE" || is_running "$FRONTEND_PID_FILE"); then
        echo "📌 访问地址:"
        echo ""
        echo "  本地访问:"
        echo "    前端界面: http://localhost:3838"
        echo "    后端API: http://localhost:8038"
        echo "    API文档: http://localhost:8038/docs"
        
        if [ ! -z "$LAN_IP" ]; then
            echo ""
            echo "  局域网访问 (其他设备可用):"
            echo "    前端界面: http://$LAN_IP:3838"
            echo "    后端API: http://$LAN_IP:8038"
            echo "    API文档: http://$LAN_IP:8038/docs"
            echo ""
            echo "  📱 手机访问: http://$LAN_IP:3838"
        fi
    fi
    
    if [ -f "$BACKEND_LOG" ] || [ -f "$FRONTEND_LOG" ]; then
        echo ""
        echo "📄 日志文件:"
        [ -f "$BACKEND_LOG" ] && echo "  后端: $BACKEND_LOG"
        [ -f "$FRONTEND_LOG" ] && echo "  前端: $FRONTEND_LOG"
    fi
    
    echo ""
}

# 查看日志
show_logs() {
    local service=$1
    local lines=${2:-50}
    
    case "$service" in
        backend)
            if [ -f "$BACKEND_LOG" ]; then
                echo -e "${BLUE}=== 后端日志 (最后 $lines 行) ===${NC}"
                tail -n "$lines" "$BACKEND_LOG"
            else
                echo -e "${RED}后端日志文件不存在${NC}"
            fi
            ;;
        frontend)
            if [ -f "$FRONTEND_LOG" ]; then
                echo -e "${BLUE}=== 前端日志 (最后 $lines 行) ===${NC}"
                tail -n "$lines" "$FRONTEND_LOG"
            else
                echo -e "${RED}前端日志文件不存在${NC}"
            fi
            ;;
        all)
            show_logs backend "$lines"
            echo ""
            show_logs frontend "$lines"
            ;;
        *)
            echo "用法: $0 logs [backend|frontend|all] [行数]"
            ;;
    esac
}

# 主函数
main() {
    case "$1" in
        start)
            echo "======================================"
            echo "   📚 小说发布系统 - 启动服务"
            echo "======================================"
            echo ""
            
            # 检查Python和Node.js
            if ! command -v python3 &> /dev/null; then
                echo -e "${RED}❌ Python3未安装，请先安装Python3${NC}"
                exit 1
            fi
            
            if ! command -v node &> /dev/null; then
                echo -e "${RED}❌ Node.js未安装，请先安装Node.js${NC}"
                exit 1
            fi
            
            start_backend
            start_frontend
            
            echo ""
            show_status
            
            echo "======================================"
            echo -e "${GREEN}   🚀 系统启动成功！${NC}"
            echo "======================================"
            echo ""
            echo "提示:"
            echo "  查看状态: $0 status"
            echo "  查看日志: $0 logs [backend|frontend|all]"
            echo "  停止服务: $0 stop"
            ;;
            
        stop)
            echo "======================================"
            echo "   📚 小说发布系统 - 停止服务"
            echo "======================================"
            echo ""
            
            stop_frontend
            stop_backend
            
            echo ""
            echo -e "${GREEN}服务已停止${NC}"
            ;;
            
        restart)
            echo "======================================"
            echo "   📚 小说发布系统 - 重启服务"
            echo "======================================"
            echo ""
            
            $0 stop
            sleep 2
            $0 start
            ;;
            
        status)
            show_status
            ;;
            
        logs)
            show_logs "${2:-all}" "${3:-50}"
            ;;
            
        *)
            echo "======================================"
            echo "   📚 小说发布系统 - 局域网启动脚本"
            echo "======================================"
            echo ""
            echo "用法: $0 {start|stop|restart|status|logs}"
            echo ""
            echo "命令说明:"
            echo "  start    - 后台启动所有服务"
            echo "  stop     - 停止所有服务"
            echo "  restart  - 重启所有服务"
            echo "  status   - 查看服务状态"
            echo "  logs     - 查看服务日志"
            echo ""
            echo "日志命令:"
            echo "  $0 logs              # 查看所有日志（最后50行）"
            echo "  $0 logs backend      # 查看后端日志"
            echo "  $0 logs frontend     # 查看前端日志"
            echo "  $0 logs all 100      # 查看所有日志（最后100行）"
            echo ""
            echo "示例:"
            echo "  $0 start             # 启动服务"
            echo "  $0 status            # 查看状态"
            echo "  $0 logs backend 100  # 查看后端最后100行日志"
            echo "  $0 stop              # 停止服务"
            ;;
    esac
}

# 执行主函数
main "$@"