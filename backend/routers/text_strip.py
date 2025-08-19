"""
文本清理API路由
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging

from services.text_strip_service import text_strip_service

logger = logging.getLogger(__name__)

# 创建路由器
router = APIRouter(prefix="/api/strip", tags=["text-strip"])


class StripRequest(BaseModel):
    """文本清理请求"""
    text: str = Field(..., description="要清理的文本")
    strip_type: str = Field(default="smart", description="清理类型: basic, clean, publish, smart")
    options: Optional[Dict[str, Any]] = Field(None, description="清理选项")


class StripResponse(BaseModel):
    """文本清理响应"""
    original_text: str = Field(..., description="原始文本")
    cleaned_text: str = Field(..., description="清理后的文本")
    stats: Dict[str, int] = Field(..., description="文本统计")
    strip_type: str = Field(..., description="使用的清理类型")


class BatchStripRequest(BaseModel):
    """批量文本清理请求"""
    texts: List[str] = Field(..., description="要清理的文本列表")
    strip_type: str = Field(default="smart", description="清理类型")
    options: Optional[Dict[str, Any]] = Field(None, description="清理选项")


class SpecificStripRequest(BaseModel):
    """特定类型清理请求"""
    text: str = Field(..., description="要清理的文本")
    strip_types: List[str] = Field(..., description="要应用的清理类型列表")


@router.post("/clean", response_model=StripResponse)
async def strip_text(request: StripRequest):
    """
    清理文本
    
    支持的清理类型:
    - basic: 基础清理（去除首尾空白）
    - clean: 提取干净文本（去除所有格式）
    - publish: 准备发布（保留段落格式）
    - smart: 智能清理（根据选项定制）
    """
    try:
        logger.info(f"开始清理文本，类型: {request.strip_type}")
        
        # 根据类型选择清理方法
        if request.strip_type == "basic":
            cleaned = text_strip_service.strip_basic(request.text)
        elif request.strip_type == "clean":
            cleaned = text_strip_service.extract_clean_text(request.text)
        elif request.strip_type == "publish":
            cleaned = text_strip_service.prepare_for_publishing(request.text)
        elif request.strip_type == "smart":
            cleaned = text_strip_service.smart_strip(request.text, request.options)
        else:
            raise ValueError(f"不支持的清理类型: {request.strip_type}")
        
        # 获取统计信息
        stats = text_strip_service.get_stats(request.text)
        
        return StripResponse(
            original_text=request.text,
            cleaned_text=cleaned,
            stats=stats,
            strip_type=request.strip_type
        )
        
    except Exception as e:
        logger.error(f"文本清理失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=List[StripResponse])
async def batch_strip_text(request: BatchStripRequest):
    """批量清理文本"""
    try:
        results = []
        
        for text in request.texts:
            if request.strip_type == "basic":
                cleaned = text_strip_service.strip_basic(text)
            elif request.strip_type == "clean":
                cleaned = text_strip_service.extract_clean_text(text)
            elif request.strip_type == "publish":
                cleaned = text_strip_service.prepare_for_publishing(text)
            elif request.strip_type == "smart":
                cleaned = text_strip_service.smart_strip(text, request.options)
            else:
                raise ValueError(f"不支持的清理类型: {request.strip_type}")
            
            stats = text_strip_service.get_stats(text)
            
            results.append(StripResponse(
                original_text=text,
                cleaned_text=cleaned,
                stats=stats,
                strip_type=request.strip_type
            ))
        
        return results
        
    except Exception as e:
        logger.error(f"批量清理失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/whitespace")
async def strip_whitespace(request: StripRequest):
    """去除空白字符"""
    try:
        cleaned = text_strip_service.strip_extra_whitespace(request.text)
        cleaned = text_strip_service.strip_empty_lines(cleaned)
        
        return {
            "original": request.text,
            "cleaned": cleaned,
            "removed_chars": len(request.text) - len(cleaned)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/html")
async def strip_html(request: StripRequest):
    """去除HTML标签"""
    try:
        cleaned = text_strip_service.strip_html_tags(request.text)
        return {
            "original": request.text,
            "cleaned": cleaned,
            "removed_chars": len(request.text) - len(cleaned)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/markdown")
async def strip_markdown(request: StripRequest):
    """去除Markdown格式"""
    try:
        cleaned = text_strip_service.strip_markdown(request.text)
        return {
            "original": request.text,
            "cleaned": cleaned,
            "removed_chars": len(request.text) - len(cleaned)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/punctuation")
async def strip_punctuation(request: SpecificStripRequest):
    """去除标点符号"""
    try:
        types = request.strip_types or ['chinese', 'english']
        cleaned = text_strip_service.strip_punctuation(request.text, types)
        return {
            "original": request.text,
            "cleaned": cleaned,
            "removed_chars": len(request.text) - len(cleaned),
            "types_removed": types
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/emoji")
async def strip_emoji(request: StripRequest):
    """去除emoji表情"""
    try:
        cleaned = text_strip_service.strip_emoji(request.text)
        return {
            "original": request.text,
            "cleaned": cleaned,
            "removed_chars": len(request.text) - len(cleaned)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/urls")
async def strip_urls(request: StripRequest):
    """去除URL链接"""
    try:
        cleaned = text_strip_service.strip_urls(request.text)
        cleaned = text_strip_service.strip_email(cleaned)
        return {
            "original": request.text,
            "cleaned": cleaned,
            "removed_chars": len(request.text) - len(cleaned)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/normalize")
async def normalize_text(request: StripRequest):
    """标准化文本（引号、标点等）"""
    try:
        cleaned = text_strip_service.normalize_quotes(request.text)
        cleaned = text_strip_service.normalize_punctuation(cleaned)
        return {
            "original": request.text,
            "normalized": cleaned,
            "changes": len([i for i, j in zip(request.text, cleaned) if i != j])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stats")
async def get_text_stats(request: StripRequest):
    """获取文本统计信息"""
    try:
        stats = text_strip_service.get_stats(request.text)
        return {
            "text_preview": request.text[:100] + "..." if len(request.text) > 100 else request.text,
            "stats": stats,
            "cleaning_potential": {
                "removable_chars": stats['total_chars'] - stats['clean_chars'],
                "percentage": round((1 - stats['clean_chars'] / stats['total_chars']) * 100, 2) if stats['total_chars'] > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/types")
async def get_strip_types():
    """获取支持的清理类型"""
    return {
        "strip_types": {
            "basic": "基础清理 - 去除首尾空白",
            "clean": "提取干净文本 - 去除所有格式和特殊字符",
            "publish": "准备发布 - 保留段落格式，添加缩进",
            "smart": "智能清理 - 根据选项自定义清理"
        },
        "specific_strips": {
            "whitespace": "去除空白字符",
            "html": "去除HTML标签",
            "markdown": "去除Markdown格式",
            "punctuation": "去除标点符号",
            "emoji": "去除emoji表情",
            "urls": "去除URL和邮箱",
            "normalize": "标准化引号和标点"
        },
        "options_for_smart": {
            "strip_whitespace": "清理空白",
            "strip_html": "清理HTML",
            "strip_markdown": "清理Markdown",
            "strip_punctuation": "清理标点",
            "strip_urls": "清理URL",
            "strip_emoji": "清理表情",
            "normalize": "标准化文本"
        }
    }