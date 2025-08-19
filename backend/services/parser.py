"""
Markdown小说解析服务
"""
import re
from typing import List, Dict
import aiofiles
from pathlib import Path

class NovelParser:
    """小说解析器"""
    
    async def parse_markdown(self, file_path: str) -> Dict:
        """
        解析Markdown文件
        
        Args:
            file_path: 文件路径
            
        Returns:
            包含标题、章节、统计信息的字典
        """
        content = await self.read_file(file_path)
        title = self.extract_title(content)
        chapters = self.extract_chapters(content)
        stats = self.calculate_stats(content, chapters)
        
        return {
            "title": title,
            "chapters": chapters,
            "stats": stats
        }
    
    async def read_file(self, file_path: str) -> str:
        """异步读取文件内容"""
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            content = await f.read()
        return content
    
    def extract_title(self, content: str) -> str:
        """
        提取标题（第一个#号标记的内容）
        
        Args:
            content: 文件内容
            
        Returns:
            作品标题
        """
        lines = content.split('\n')
        
        # 查找第一个以#开头的行（但不是##）
        for line in lines:
            line = line.strip()
            if line.startswith('#') and not line.startswith('##'):
                # 移除#号和空格
                title = re.sub(r'^#+\s*', '', line).strip()
                if title:
                    return title
        
        # 如果没找到#标题，尝试第3行（兼容旧格式）
        if len(lines) >= 3:
            title = lines[2].strip()
            title = title.replace('#', '').strip()
            if title:
                return title
                
        return "未命名作品"
    
    def extract_chapters(self, content: str) -> List[Dict[str, str]]:
        """
        提取章节列表
        
        Args:
            content: 文件内容
            
        Returns:
            章节列表，每个章节包含标题和内容
        """
        chapters = []
        # 匹配二级标题作为章节标题
        pattern = r'^##\s+(.+?)$'
        lines = content.split('\n')
        
        current_title = None
        current_content = []
        
        for i, line in enumerate(lines):
            match = re.match(pattern, line)
            if match:
                # 保存前一章节
                if current_title:
                    chapters.append({
                        "chapterTitle": current_title,
                        "content": '\n'.join(current_content).strip()
                    })
                # 开始新章节
                current_title = match.group(1)
                current_content = []
            elif current_title:
                # 累积章节内容
                current_content.append(line)
        
        # 添加最后一章
        if current_title:
            chapters.append({
                "chapterTitle": current_title,
                "content": '\n'.join(current_content).strip()
            })
        
        return chapters
    
    def calculate_stats(self, content: str, chapters: List[Dict]) -> Dict:
        """
        计算统计信息
        
        Args:
            content: 文件内容
            chapters: 章节列表
            
        Returns:
            统计信息字典
        """
        # 移除Markdown标记计算实际字数
        text = re.sub(r'[#*`\[\]()]', '', content)
        # 移除空格和换行
        text = text.replace(' ', '').replace('\n', '').replace('\r', '')
        
        return {
            "wordCount": len(text),
            "chapterCount": len(chapters)
        }