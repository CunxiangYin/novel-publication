"""
FastAPI主应用入口
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
from datetime import datetime
from pathlib import Path

from routers import novel_router
from routers import text_strip
from config.settings import settings

# 配置日志
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="小说发布结构化系统",
    description="将Markdown格式的小说文件结构化为发布格式，支持AI生成元数据",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(novel_router)
app.include_router(text_strip.router)

# 挂载静态文件目录
static_path = Path(__file__).parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# WebSocket连接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"WebSocket连接建立: {client_id}")
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"WebSocket连接断开: {client_id}")
    
    async def send_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for client_id, websocket in self.active_connections.items():
            await websocket.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    """根路径 - 返回HTML界面"""
    html_file = Path(__file__).parent / "static" / "index.html"
    if html_file.exists():
        return FileResponse(str(html_file))
    else:
        return {
            "name": "小说发布结构化系统",
            "version": "1.0.0",
            "status": "running",
            "endpoints": {
                "web": "/static/index.html",
                "parse": "/api/novel/parse",
                "update": "/api/novel/update",
                "publish": "/api/novel/publish",
                "upload": "/api/novel/upload",
                "list": "/api/novel/list",
                "health": "/api/novel/health",
                "docs": "/docs",
                "redoc": "/redoc"
            }
        }

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    WebSocket端点，用于实时通信
    """
    await manager.connect(websocket, client_id)
    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            logger.info(f"收到消息 from {client_id}: {data}")
            
            # 处理消息并返回
            response = {
                "client_id": client_id,
                "message": f"已收到: {data}",
                "timestamp": datetime.now().isoformat()
            }
            
            await manager.send_message(str(response), client_id)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        logger.info(f"客户端断开连接: {client_id}")
    except Exception as e:
        logger.error(f"WebSocket错误: {e}")
        manager.disconnect(client_id)

@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info("=" * 50)
    logger.info("小说发布结构化系统启动")
    logger.info(f"版本: 1.0.0")
    logger.info(f"端口: {settings.port}")
    logger.info(f"环境: {'开发' if settings.anthropic_api_key == 'your_api_key_here' else '生产'}")
    
    # 确保必要的目录存在
    paths = [
        Path(settings.novel_dir),
        Path(settings.backup_dir),
        Path(settings.upload_dir)
    ]
    
    for path in paths:
        path.mkdir(parents=True, exist_ok=True)
        logger.info(f"确保目录存在: {path}")
    
    logger.info("=" * 50)

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    logger.info("小说发布结构化系统关闭")

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """404错误处理"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": f"路径 {request.url.path} 不存在",
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """500错误处理"""
    logger.error(f"内部错误: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "服务器内部错误，请稍后重试",
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    # 直接运行时启动服务器
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower()
    )