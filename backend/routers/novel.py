"""
小说处理相关路由
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
import httpx
import hashlib
from datetime import datetime
import logging
import aiofiles
from pathlib import Path

from models.publication import (
    PublicationData, 
    ParseRequest, 
    UpdateRequest,
    GenerateRequest,
    PublishRequest,
    Chapter
)
from services import NovelParser, ClaudeService, FileManager
from config.settings import settings

# 配置日志
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

# 创建路由器
router = APIRouter(prefix="/api/novel", tags=["novel"])

# 初始化服务
file_manager = FileManager()

@router.post("/parse", response_model=PublicationData)
async def parse_novel(request: ParseRequest):
    """
    解析小说文件并生成结构化数据
    
    Args:
        request: 解析请求，包含文件路径和选项
        
    Returns:
        PublicationData: 完整的发布数据
    """
    try:
        logger.info(f"开始解析文件: {request.filePath}")
        
        # 解析文件
        parser = NovelParser()
        raw_data = await parser.parse_markdown(request.filePath)
        logger.info(f"文件解析成功，共{raw_data['stats']['chapterCount']}章")
        
        # 检查是否有API密钥
        if not settings.anthropic_api_key or settings.anthropic_api_key == "your_api_key_here":
            logger.warning("未配置Anthropic API密钥，使用默认值")
            # 使用默认值
            metadata = {
                "intro": f"《{raw_data['title']}》是一部精彩的网络小说，共{raw_data['stats']['chapterCount']}章，约{raw_data['stats']['wordCount']}字。",
                "author": "佚名",
                "firstCategory": "女频",
                "secondCategory": "现代言情",
                "thirdCategory": "都市生活",
                "awesomeParagraph": raw_data['chapters'][0]['content'][:500] if raw_data['chapters'] else "暂无内容",
                "coverPrompt": None
            }
        else:
            # 初始化Claude服务
            claude = ClaudeService(api_key=settings.anthropic_api_key)
            
            # 一次性生成所有元数据（优化API调用）
            logger.info("开始生成元数据...")
            metadata = await claude.generate_all_metadata(
                raw_data["title"],
                raw_data["chapters"]
            )
            logger.info("元数据生成成功")
        
        # 构建完整的发布数据
        publication_data = {
            "title": raw_data["title"],
            "intro": metadata["intro"],
            "author": metadata["author"],
            "firstCategory": metadata["firstCategory"],
            "secondCategory": metadata["secondCategory"],
            "thirdCategory": metadata["thirdCategory"],
            "awesomeParagraph": metadata["awesomeParagraph"],
            "coverPrompt": metadata.get("coverPrompt"),
            "completeStatus": 2,
            "chapterList": [Chapter(**{**ch, "seq": idx + 1}) for idx, ch in enumerate(raw_data["chapters"])],
            "metadata": {
                "sourceFile": request.filePath,
                "wordCount": raw_data["stats"]["wordCount"],
                "chapterCount": raw_data["stats"]["chapterCount"],
                "parseTime": datetime.now()
            }
        }
        
        return PublicationData(**publication_data)
        
    except FileNotFoundError:
        logger.error(f"文件不存在: {request.filePath}")
        raise HTTPException(status_code=404, detail=f"文件不存在: {request.filePath}")
    except Exception as e:
        logger.error(f"解析失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update")
async def update_novel(request: UpdateRequest):
    """
    更新小说数据并保存
    
    Args:
        request: 更新请求，包含文件路径和更新的数据
        
    Returns:
        成功消息
    """
    try:
        logger.info(f"更新文件: {request.filePath}")
        await file_manager.save_novel_file(request.filePath, request.data)
        return {"success": True, "message": "文件已更新"}
    except Exception as e:
        logger.error(f"更新失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-paragraph")
async def generate_paragraph(request: GenerateRequest):
    """
    生成精彩片段
    
    Args:
        request: 生成请求，包含章节列表和长度要求
        
    Returns:
        精彩片段
    """
    try:
        if not settings.anthropic_api_key or settings.anthropic_api_key == "your_api_key_here":
            # 从原文提取
            content = ""
            for ch in request.chapters[:3]:
                content += ch.content[:request.minLength // 3]
            return {"awesomeParagraph": content[:request.maxLength]}
        
        claude = ClaudeService(api_key=settings.anthropic_api_key)
        chapters_dict = [ch.dict() for ch in request.chapters]
        paragraph = await claude.generate_awesome_paragraph(chapters_dict)
        
        # 确保字数在要求范围内
        if len(paragraph) < request.minLength:
            paragraph = paragraph + " " * (request.minLength - len(paragraph))
        elif len(paragraph) > request.maxLength:
            paragraph = paragraph[:request.maxLength]
        
        return {"awesomeParagraph": paragraph}
    except Exception as e:
        logger.error(f"生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/publish")
async def publish_novel(request: PublishRequest):
    """
    发布到指定平台
    
    Args:
        request: 发布请求，包含发布数据和目标平台
        
    Returns:
        发布结果
    """
    try:
        logger.info(f"开始发布到平台: {request.platform}")
        
        # 生成签名
        date = datetime.now().strftime("%Y%m%d")
        signature = hashlib.md5(f"{date}{settings.publish_secret}".encode()).hexdigest()
        
        # 准备发布数据（排除metadata）
        publish_data = request.data.dict(exclude={"metadata"})
        
        # 添加cover字段（如果没有则使用空字符串）
        if 'cover' not in publish_data:
            publish_data['cover'] = ""  # 这里可以后续集成图片生成服务
        
        # 处理章节数据格式
        formatted_chapters = []
        for index, chapter in enumerate(publish_data['chapterList']):
            formatted_chapter = {
                'chapterTitle': chapter.get('chapterTitle', ''),
                'content': chapter.get('content', ''),  # 使用content字段
                'seq': index + 1  # 章节相对顺序，从1开始
            }
            formatted_chapters.append(formatted_chapter)
        
        publish_data['chapterList'] = formatted_chapters
        
        logger.info(f"发布数据: 标题={publish_data['title']}, 章节数={len(publish_data['chapterList'])}")
        
        # 发送请求
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                settings.publish_endpoint,
                json=publish_data,
                headers={"X-Signature": signature}
            )
        
        logger.info(f"发布响应: status={response.status_code}")
        
        if response.status_code == 200:
            return {
                "success": True,
                "response": response.json(),
                "message": "发布成功"
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"发布失败: {response.text}"
            )
            
    except httpx.RequestError as e:
        logger.error(f"网络请求失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"网络请求失败: {str(e)}")
    except Exception as e:
        logger.error(f"发布失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_novel(file: UploadFile = File(...)):
    """
    上传小说文件
    
    Args:
        file: 上传的文件
        
    Returns:
        文件路径和文件名
    """
    try:
        logger.info(f"接收上传文件: {file.filename}")
        
        # 检查文件类型
        if not file.filename.endswith('.md'):
            raise HTTPException(status_code=400, detail="只支持Markdown文件(.md)")
        
        # 读取文件内容
        content = await file.read()
        
        # 保存文件
        file_path = await file_manager.save_upload_file(content, file.filename)
        
        return {
            "success": True,
            "filePath": file_path,
            "filename": file.filename,
            "size": len(content)
        }
    except Exception as e:
        logger.error(f"上传失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_novels():
    """
    列出所有小说文件
    
    Returns:
        小说文件列表
    """
    try:
        novels = await file_manager.list_novels()
        return {
            "success": True,
            "novels": novels,
            "total": len(novels)
        }
    except Exception as e:
        logger.error(f"列出文件失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/{format}")
async def export_novel(data: PublicationData, format: str = "json"):
    """
    导出小说数据
    
    Args:
        data: 发布数据
        format: 导出格式（json/markdown）
        
    Returns:
        导出的内容
    """
    try:
        if format == "json":
            json_str = await file_manager.export_json(data)
            return {
                "success": True,
                "format": "json",
                "content": json_str
            }
        elif format == "markdown":
            content = file_manager._reconstruct_markdown(data)
            return {
                "success": True,
                "format": "markdown",
                "content": content
            }
        else:
            raise HTTPException(status_code=400, detail=f"不支持的格式: {format}")
    except Exception as e:
        logger.error(f"导出失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "novel-publication",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }