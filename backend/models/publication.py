"""
数据模型定义
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Chapter(BaseModel):
    """章节模型"""
    chapterTitle: str = Field(..., description="章节标题")
    content: str = Field(..., description="章节内容")
    seq: Optional[int] = Field(None, description="章节相对顺序")

class Metadata(BaseModel):
    """元数据模型"""
    sourceFile: str = Field(..., description="源文件路径")
    parseTime: datetime = Field(default_factory=datetime.now, description="解析时间")
    wordCount: int = Field(..., description="总字数")
    chapterCount: int = Field(..., description="章节数")

class PublicationData(BaseModel):
    """发布数据模型"""
    # 基础信息
    title: str = Field(..., description="作品标题（从第3行提取）")
    intro: str = Field(..., description="作品简介（Claude生成）")
    author: str = Field(default="默认作者", description="作者名（Claude生成或配置）")
    
    # 分类信息
    firstCategory: str = Field(..., description="一级分类（Claude分析生成）")
    secondCategory: str = Field(..., description="二级分类（Claude分析生成）")
    thirdCategory: str = Field(..., description="三级分类（Claude分析生成）")
    
    # 状态和内容
    completeStatus: int = Field(default=2, description="完结状态（2=完结）")
    awesomeParagraph: str = Field(..., description="精彩片段（Claude生成，400-1000字）")
    coverPrompt: Optional[str] = Field(None, description="封面图生成prompt（Claude生成）")
    
    # 章节列表
    chapterList: List[Chapter] = Field(..., description="章节列表")
    
    # 元数据（内部使用）
    metadata: Optional[Metadata] = Field(None, description="元数据")

class ParseOptions(BaseModel):
    """解析选项"""
    generateIntro: bool = Field(default=True, description="生成简介")
    generateAwesomeParagraph: bool = Field(default=True, description="生成精彩片段")
    autoCategories: bool = Field(default=True, description="自动分类")

class ParseRequest(BaseModel):
    """解析请求"""
    filePath: str = Field(..., description="文件路径")
    options: Optional[ParseOptions] = Field(default_factory=ParseOptions)

class UpdateRequest(BaseModel):
    """更新请求"""
    filePath: str = Field(..., description="文件路径")
    data: PublicationData = Field(..., description="更新的数据")

class GenerateRequest(BaseModel):
    """生成请求"""
    chapters: List[Chapter] = Field(..., description="章节列表")
    minLength: int = Field(default=400, description="最小长度")
    maxLength: int = Field(default=1000, description="最大长度")

class PublishRequest(BaseModel):
    """发布请求"""
    data: PublicationData = Field(..., description="发布数据")
    platform: str = Field(default="wechat", description="发布平台")