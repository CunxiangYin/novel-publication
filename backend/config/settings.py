"""
配置管理模块
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API配置
    anthropic_api_key: str = ""
    port: int = 8038
    
    # 文件路径
    novel_dir: str = "./data/novels"
    backup_dir: str = "./data/backups"
    upload_dir: str = "./uploads"
    
    # 发布配置
    publish_endpoint: str = "https://wxrd.alongmen.com/book/v1/uploadBookInfo"
    publish_secret: str = "aiGenerateBook"
    
    # 日志配置
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# 创建全局配置实例
settings = Settings()

# 分类映射配置
CATEGORY_MAPPING = {
    "女频": {
        "现代言情": ["豪门总裁", "都市生活", "婚恋情缘"],
        "古代言情": ["宫廷侯爵", "古典架空", "穿越奇情"],
        "浪漫青春": ["青春校园", "青春纯爱", "青春疼痛"]
    },
    "男频": {
        "都市": ["都市生活", "异术超能", "都市异能"],
        "玄幻": ["东方玄幻", "异世大陆", "王朝争霸"],
        "仙侠": ["古典仙侠", "幻想修仙", "现代修真"]
    }
}