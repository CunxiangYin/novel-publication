"""
文件管理服务
"""
import aiofiles
import json
from pathlib import Path
from datetime import datetime
import shutil
import logging
from typing import Optional
from models.publication import PublicationData

logger = logging.getLogger(__name__)

class FileManager:
    """文件管理器"""
    
    def __init__(self, base_path: str = "./data"):
        """
        初始化文件管理器
        
        Args:
            base_path: 基础路径
        """
        self.base_path = Path(base_path)
        self.backup_path = self.base_path / "backups"
        self.novels_path = self.base_path / "novels"
        
        # 确保目录存在
        self.backup_path.mkdir(parents=True, exist_ok=True)
        self.novels_path.mkdir(parents=True, exist_ok=True)
    
    async def read_novel_file(self, file_path: str) -> str:
        """
        异步读取Markdown文件
        
        Args:
            file_path: 文件路径
            
        Returns:
            文件内容
        """
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                content = await f.read()
            logger.info(f"成功读取文件: {file_path}")
            return content
        except Exception as e:
            logger.error(f"读取文件失败 {file_path}: {e}")
            raise
    
    async def save_novel_file(self, file_path: str, data: PublicationData) -> None:
        """
        保存修改后的内容回MD文件
        
        Args:
            file_path: 文件路径
            data: 发布数据
        """
        try:
            # 先备份原文件
            backup_file = await self.backup_file(file_path)
            logger.info(f"已备份文件到: {backup_file}")
            
            # 重构MD内容
            content = self._reconstruct_markdown(data)
            
            # 保存文件
            async with aiofiles.open(file_path, 'w', encoding='utf-8') as f:
                await f.write(content)
            
            logger.info(f"成功保存文件: {file_path}")
            
        except Exception as e:
            logger.error(f"保存文件失败 {file_path}: {e}")
            raise
    
    def _reconstruct_markdown(self, data: PublicationData) -> str:
        """
        将结构化数据重构为Markdown格式
        
        Args:
            data: 发布数据
            
        Returns:
            Markdown格式的内容
        """
        lines = [
            "# 女频小说初稿",
            "",
            f"# {data.title}",
            "",
            "---",
            "",
            f"**作者**: {data.author}",
            "",
            f"**分类**: {data.firstCategory} > {data.secondCategory} > {data.thirdCategory}",
            "",
            "## 作品简介",
            "",
            data.intro,
            "",
            "## 精彩片段",
            "",
            data.awesomeParagraph,
            "",
            "---",
            ""
        ]
        
        # 添加章节内容
        for chapter in data.chapterList:
            lines.append(f"## {chapter.chapterTitle}")
            lines.append("")
            lines.append(chapter.content)
            lines.append("")
        
        return '\n'.join(lines)
    
    async def export_json(self, data: PublicationData, output_path: Optional[str] = None) -> str:
        """
        导出JSON格式
        
        Args:
            data: 发布数据
            output_path: 输出路径（可选）
            
        Returns:
            JSON字符串
        """
        try:
            # 转换为字典并移除metadata
            data_dict = data.dict(exclude={'metadata'})
            json_str = json.dumps(data_dict, ensure_ascii=False, indent=2)
            
            # 如果指定了输出路径，保存到文件
            if output_path:
                async with aiofiles.open(output_path, 'w', encoding='utf-8') as f:
                    await f.write(json_str)
                logger.info(f"JSON已导出到: {output_path}")
            
            return json_str
            
        except Exception as e:
            logger.error(f"导出JSON失败: {e}")
            raise
    
    async def backup_file(self, file_path: str) -> str:
        """
        备份原文件
        
        Args:
            file_path: 文件路径
            
        Returns:
            备份文件路径
        """
        try:
            source = Path(file_path)
            
            # 生成备份文件名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"{source.stem}_{timestamp}{source.suffix}"
            backup_file = self.backup_path / backup_name
            
            # 执行备份
            shutil.copy2(source, backup_file)
            logger.info(f"文件已备份: {source} -> {backup_file}")
            
            return str(backup_file)
            
        except Exception as e:
            logger.error(f"备份文件失败 {file_path}: {e}")
            raise
    
    async def list_novels(self) -> list:
        """
        列出所有小说文件
        
        Returns:
            小说文件列表
        """
        novels = []
        for file in self.novels_path.glob("**/*.md"):
            novels.append({
                "path": str(file),
                "name": file.name,
                "size": file.stat().st_size,
                "modified": datetime.fromtimestamp(file.stat().st_mtime).isoformat()
            })
        return novels
    
    async def save_upload_file(self, file_content: bytes, filename: str) -> str:
        """
        保存上传的文件
        
        Args:
            file_content: 文件内容
            filename: 文件名
            
        Returns:
            保存的文件路径
        """
        try:
            # 生成唯一文件名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = f"{timestamp}_{filename}"
            file_path = self.novels_path / safe_filename
            
            # 保存文件
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_content)
            
            logger.info(f"上传文件已保存: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"保存上传文件失败: {e}")
            raise