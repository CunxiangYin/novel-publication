"""
Claude API集成服务
"""
from anthropic import AsyncAnthropic
from typing import List, Optional, Dict
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

class ClaudeService:
    """Claude API服务"""
    
    def __init__(self, api_key: str):
        """
        初始化Claude服务
        
        Args:
            api_key: Anthropic API密钥
        """
        self.client = AsyncAnthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"  # 使用Claude 3.5 Sonnet模型
    
    async def generate_all_metadata(self, title: str, chapters: List[dict]) -> Dict:
        """
        一次性生成所有需要的元数据
        
        Args:
            title: 作品标题
            chapters: 章节列表
            
        Returns:
            包含所有元数据的字典
        """
        sample_content = self._get_sample_content(chapters)
        
        prompt = f"""
        基于以下小说内容，生成完整的作品元数据。

        标题：{title}
        内容样本：{sample_content}

        请生成以下信息，以JSON格式返回：
        {{
            "intro": "作品简介（200-300字，突出故事核心冲突和人物关系）",
            "author": "作者笔名（根据作品风格生成合适的2-4字中文笔名）",
            "firstCategory": "一级分类（女频/男频）",
            "secondCategory": "二级分类（如：现代言情、古代言情、都市、玄幻等）",
            "thirdCategory": "三级分类（如：豪门总裁、都市生活、东方玄幻等）",
            "awesomeParagraph": "精彩片段（400-1000字，选择最吸引人的情节片段，保持原文风格）",
            "coverPrompt": "封面图生成prompt（80-150字，包含场景、人物、氛围、风格等，适合AI绘图工具如Midjourney或DALL-E）"
        }}

        分类参考：
        女频：
        - 现代言情：豪门总裁、都市生活、婚恋情缘
        - 古代言情：宫廷侯爵、古典架空、穿越奇情
        - 浪漫青春：青春校园、青春纯爱
        
        男频：
        - 都市：都市生活、异术超能、都市异能
        - 玄幻：东方玄幻、异世大陆、王朝争霸
        - 仙侠：古典仙侠、幻想修仙、现代修真

        请直接返回JSON格式的数据，不要有其他说明。
        """
        
        try:
            logger.debug(f"Claude client type: {type(self.client)}")
            logger.debug(f"Has messages attr: {hasattr(self.client, 'messages')}")
            
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # 解析返回的JSON
            metadata = json.loads(response.content[0].text)
            logger.info("成功生成所有元数据")
            return metadata
            
        except json.JSONDecodeError as e:
            logger.warning(f"JSON解析失败，降级为分别生成: {e}")
            # 如果解析失败，分别调用各个方法
            return await self._generate_metadata_separately(title, chapters)
        except Exception as e:
            import traceback
            logger.error(f"生成元数据失败: {e}")
            logger.error(f"详细错误: {traceback.format_exc()}")
            # 返回默认值
            return await self._get_default_metadata(title, chapters)
    
    async def _generate_metadata_separately(self, title: str, chapters: List[dict]) -> Dict:
        """
        分别生成各项元数据（降级方案）
        
        Args:
            title: 作品标题
            chapters: 章节列表
            
        Returns:
            元数据字典
        """
        tasks = [
            self.generate_intro(title, chapters),
            self.generate_author(title, chapters),
            self.generate_categories(title, chapters),
            self.generate_awesome_paragraph(chapters),
            self.generate_cover_prompt(title, chapters)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理可能的异常
        intro = results[0] if not isinstance(results[0], Exception) else "暂无简介"
        author = results[1] if not isinstance(results[1], Exception) else "佚名"
        categories = results[2] if not isinstance(results[2], Exception) else {
            "firstCategory": "女频",
            "secondCategory": "现代言情",
            "thirdCategory": "都市生活"
        }
        awesome = results[3] if not isinstance(results[3], Exception) else self._extract_from_original(chapters, 400)
        cover_prompt = results[4] if not isinstance(results[4], Exception) else None
        
        return {
            "intro": intro,
            "author": author,
            **categories,
            "awesomeParagraph": awesome,
            "coverPrompt": cover_prompt
        }
    
    async def generate_intro(self, title: str, chapters: List[dict]) -> str:
        """生成作品简介"""
        sample_content = self._get_sample_content(chapters, max_chapters=3)
        
        prompt = f"""
        基于以下小说信息生成200-300字的作品简介：
        
        标题：{title}
        内容样本：{sample_content}
        
        要求：
        1. 突出故事核心冲突
        2. 介绍主要人物关系
        3. 设置悬念吸引读者
        4. 语言简洁有吸引力
        5. 不要剧透结局
        
        直接返回简介内容，不要有其他说明。
        """
        
        try:
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except Exception as e:
            logger.error(f"生成简介失败: {e}")
            return "暂无简介"
    
    async def generate_author(self, title: str, chapters: List[dict]) -> str:
        """生成作者笔名"""
        sample_content = chapters[0]['content'][:500] if chapters else ""
        
        prompt = f"""
        基于以下小说的标题和风格，生成一个合适的作者笔名：
        
        标题：{title}
        内容风格样本：{sample_content}
        
        要求：
        1. 笔名要符合作品风格
        2. 2-4个字的中文笔名
        3. 朗朗上口，容易记忆
        4. 适合网络文学平台
        
        直接返回笔名，不要有其他说明。
        """
        
        try:
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=50,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except Exception as e:
            logger.error(f"生成作者名失败: {e}")
            return "佚名"
    
    async def generate_categories(self, title: str, chapters: List[dict]) -> dict:
        """生成智能分类"""
        sample_content = self._get_sample_content(chapters, max_chapters=3)
        
        prompt = f"""
        分析以下小说内容，确定其分类：
        
        标题：{title}
        内容样本：{sample_content}
        
        根据内容特征，返回JSON格式的分类：
        {{
            "firstCategory": "女频或男频",
            "secondCategory": "二级分类",
            "thirdCategory": "三级分类"
        }}
        
        分类参考：
        女频：
        - 现代言情：豪门总裁、都市生活、婚恋情缘
        - 古代言情：宫廷侯爵、古典架空、穿越奇情
        - 浪漫青春：青春校园、青春纯爱
        
        男频：
        - 都市：都市生活、异术超能、都市异能
        - 玄幻：东方玄幻、异世大陆、王朝争霸
        - 仙侠：古典仙侠、幻想修仙、现代修真
        
        只返回JSON，不要其他说明。
        """
        
        try:
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            return json.loads(response.content[0].text)
        except Exception as e:
            logger.error(f"生成分类失败: {e}")
            # 默认分类
            return {
                "firstCategory": "女频",
                "secondCategory": "现代言情",
                "thirdCategory": "都市生活"
            }
    
    async def generate_cover_prompt(self, title: str, chapters: List[dict]) -> str:
        """生成封面图prompt"""
        sample_content = self._get_sample_content(chapters, max_chapters=2)
        
        prompt = f"""
        基于以下小说内容，生成一个适合AI绘图工具（如Midjourney或DALL-E）的封面图生成prompt：
        
        标题：{title}
        内容样本：{sample_content}
        
        要求：
        1. 80-150字的英文prompt
        2. 包含主要场景、人物特征、氛围、风格
        3. 突出小说的核心主题和情感基调
        4. 使用具体的视觉描述词汇
        5. 风格参考：digital art, book cover, romantic novel, Chinese style等
        
        直接返回英文prompt，不要有其他说明。
        """
        
        try:
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except Exception as e:
            logger.error(f"生成封面prompt失败: {e}")
            return None
    
    async def generate_awesome_paragraph(self, chapters: List[dict]) -> str:
        """生成精彩片段（400-1000字）"""
        sample_chapters = chapters[:5] if len(chapters) > 5 else chapters
        
        prompt = f"""
        从以下小说章节中提取或改写一段400-1000字的精彩片段：
        
        {self._format_chapters(sample_chapters)}
        
        要求：
        1. 选择最吸引人的情节片段
        2. 保持原文风格和语言特色
        3. 字数必须在400-1000字之间
        4. 能够吸引读者继续阅读
        5. 避免剧透关键情节
        6. 如果原文某段已经很精彩，可以直接引用
        
        直接返回精彩片段内容，不要有任何其他说明或标记。
        """
        
        try:
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            paragraph = response.content[0].text.strip()
            
            # 确保字数在范围内
            if len(paragraph) > 1000:
                paragraph = paragraph[:1000]
            elif len(paragraph) < 400:
                # 如果太短，从原文中补充
                paragraph = self._extract_from_original(chapters, 400)
            
            return paragraph
        except Exception as e:
            logger.error(f"生成精彩片段失败: {e}")
            return self._extract_from_original(chapters, 400)
    
    async def _get_default_metadata(self, title: str, chapters: List[dict]) -> Dict:
        """获取默认元数据（备用方案）"""
        # 从原文提取一些内容作为精彩片段
        awesome_paragraph = self._extract_from_original(chapters, 400)
        
        return {
            "intro": f"《{title}》是一部精彩的网络小说，情节跌宕起伏，人物形象鲜明，值得一读。",
            "author": "佚名",
            "firstCategory": "女频",
            "secondCategory": "现代言情",
            "thirdCategory": "都市生活",
            "awesomeParagraph": awesome_paragraph,
            "coverPrompt": None
        }
    
    def _get_sample_content(self, chapters: List[dict], max_chapters: int = 5) -> str:
        """获取章节样本内容"""
        sample_chapters = chapters[:max_chapters] if len(chapters) > max_chapters else chapters
        samples = []
        for ch in sample_chapters:
            content = ch['content'][:1000] if len(ch['content']) > 1000 else ch['content']
            samples.append(f"【{ch['chapterTitle']}】\n{content}")
        return '\n\n'.join(samples)
    
    def _format_chapters(self, chapters: List[dict]) -> str:
        """格式化章节内容"""
        formatted = []
        for ch in chapters:
            content = ch['content'][:1500] if len(ch['content']) > 1500 else ch['content']
            formatted.append(f"【{ch['chapterTitle']}】\n{content}")
        return '\n\n'.join(formatted)
    
    def _extract_from_original(self, chapters: List[dict], min_length: int) -> str:
        """从原文提取精彩片段"""
        if not chapters:
            return "暂无内容"
        
        # 查找对话或冲突场景
        for chapter in chapters:
            content = chapter['content']
            # 查找包含对话或感叹号、问号的段落（通常比较精彩）
            if '"' in content or '！' in content or '？' in content:
                # 尝试找到对话开始的位置
                for marker in ['"', '！', '？']:
                    if marker in content:
                        start = content.find(marker)
                        if start > 0:
                            # 往前找100个字符作为上下文
                            start = max(0, start - 100)
                            excerpt = content[start:start + min_length + 100]
                            if len(excerpt) >= min_length:
                                return excerpt[:min_length]
        
        # 如果没找到对话，返回第一章的开头
        first_chapter_content = chapters[0]['content']
        return first_chapter_content[:min_length] if len(first_chapter_content) >= min_length else first_chapter_content