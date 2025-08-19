#!/bin/bash

echo "======================================="
echo "   网络访问诊断脚本"
echo "======================================="
echo ""

# 获取本机IP
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

echo "1. 本机网络信息:"
echo "   - 本机IP: $LAN_IP"
echo ""

echo "2. 服务监听状态:"
echo "   后端服务 (8038):"
lsof -i :8038 -P -n | grep LISTEN | head -1 || echo "   未监听"
echo ""
echo "   前端服务 (3838):"
lsof -i :3838 -P -n | grep LISTEN | head -1 || echo "   未监听"
echo ""

echo "3. 防火墙设置建议:"
echo ""
echo "   macOS (如果启用了防火墙):"
echo "   - 系统偏好设置 -> 安全性与隐私 -> 防火墙"
echo "   - 点击'防火墙选项'"
echo "   - 添加 node 和 Python 到允许列表"
echo ""
echo "   或使用命令行 (需要管理员权限):"
echo "   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3"
echo "   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(which node)"
echo ""

echo "4. 测试命令 (在其他机器上运行):"
echo ""
echo "   测试后端连通性:"
echo "   curl http://$LAN_IP:8038/api/novel/health"
echo ""
echo "   测试前端连通性:"
echo "   curl -I http://$LAN_IP:3838"
echo ""

echo "5. 前端生产构建 (推荐用于跨机器访问):"
echo "   cd frontend"
echo "   npm run build"
echo "   npm run preview -- --host 0.0.0.0 --port 3838"
echo ""

echo "6. 常见问题:"
echo "   - 确保两台机器在同一网段"
echo "   - 检查路由器是否有客户端隔离设置"
echo "   - 确保没有第三方防火墙软件阻止"
echo ""

# 检查是否在开发模式
if ps aux | grep -q "[v]ite.*dev"; then
    echo "⚠️  警告: 前端正在开发模式下运行"
    echo "   开发模式可能导致跨机器访问问题"
    echo "   建议使用生产构建模式"
fi

echo ""
echo "======================================="