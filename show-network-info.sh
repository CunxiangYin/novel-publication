#!/bin/bash

echo "======================================"
echo "   📡 网络访问信息"
echo "======================================"
echo ""

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

echo "📌 服务访问地址:"
echo ""
echo "  本地访问:"
echo "    前端界面: http://localhost:3838"
echo "    后端API:  http://localhost:8038"
echo "    API文档:  http://localhost:8038/docs"
echo ""

if [ ! -z "$LAN_IP" ]; then
    echo "  局域网访问 (其他设备可用):"
    echo "    前端界面: http://$LAN_IP:3838"
    echo "    后端API:  http://$LAN_IP:8038"
    echo "    API文档:  http://$LAN_IP:8038/docs"
    echo ""
    echo "  📱 手机访问:"
    echo "    在同一WiFi网络下，使用手机浏览器访问:"
    echo "    http://$LAN_IP:3838"
    echo ""
    echo "  💻 其他电脑访问:"
    echo "    在同一局域网下，使用浏览器访问:"
    echo "    http://$LAN_IP:3838"
else
    echo "  ⚠️  无法获取局域网IP地址"
fi

echo ""
echo "======================================"
echo "  ⚙️  服务状态检查:"
echo "======================================"

# 检查后端服务
if curl -s http://localhost:8038 > /dev/null 2>&1; then
    echo "  ✅ 后端服务运行中 (端口 8038)"
else
    echo "  ❌ 后端服务未运行"
fi

# 检查前端服务
if curl -s http://localhost:3838 > /dev/null 2>&1; then
    echo "  ✅ 前端服务运行中 (端口 3838)"
else
    echo "  ❌ 前端服务未运行"
fi

echo ""
echo "======================================"