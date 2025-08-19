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
            "intro": "作品简介（400-1000字，详细介绍故事背景、核心冲突和人物关系）",
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
        """生成作品简介（400-1000字）"""
        sample_content = self._get_sample_content(chapters, max_chapters=5)
        
        prompt = f"""
        基于以下小说信息生成一篇详细的作品简介，字数要求：最少400字，最多1000字。

        标题：{title}
        内容样本：{sample_content}

        写作要求：
        1. 开篇介绍故事的时代背景、世界观设定（100-150字）
        2. 详细描述主人公的身份、性格、处境和目标（100-150字）
        3. 介绍主要配角和他们与主角的关系（80-120字）
        4. 阐述故事的核心冲突和主要矛盾（80-120字）
        5. 设置2-3个悬念点，吸引读者阅读（60-100字）
        6. 总结故事特色和看点（60-100字）
        
        注意：
        - 必须写够400字以上，但不超过1000字
        - 语言要生动流畅，有吸引力
        - 不要剧透关键情节和结局
        - 分段组织，结构清晰
        
        直接返回简介内容，不要有其他说明。
        """
        
        try:
            response = await self.client.messages.create(
                model="claude-3-5-sonnet-20241022",  # 使用更强的模型
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            intro = response.content[0].text.strip()
            
            # 确保字数在范围内
            if len(intro) > 1000:
                intro = intro[:1000]
            elif len(intro) < 400:
                logger.warning(f"AI生成的简介只有{len(intro)}字，使用保底方案")
                # 直接使用保底方案确保字数
                intro = self._get_default_intro(title, chapters)
                    
            return intro
        except Exception as e:
            logger.error(f"生成简介失败: {e}")
            return self._get_default_intro(title, chapters)
    
    def _generate_intro_from_chapters(self, title: str, chapters: List[dict]) -> str:
        """从章节内容生成补充简介"""
        intro_parts = []
        
        if chapters:
            # 从第一章提取背景信息
            first_chapter = chapters[0]['content'][:300] if chapters else ""
            intro_parts.append(f"故事开篇，{first_chapter[:100]}...")
            
            # 从章节标题推断故事发展
            if len(chapters) > 1:
                chapter_titles = [ch['chapterTitle'] for ch in chapters[:5]]
                intro_parts.append(f"随着剧情推进，主角将经历{', '.join(chapter_titles)}等重要阶段。")
        
        intro_parts.append(f"《{title}》以其独特的叙事风格和丰富的想象力，构建了一个引人入胜的故事世界。")
        intro_parts.append("书中人物性格鲜明，情节环环相扣，每一个转折都出人意料又在情理之中。")
        intro_parts.append("无论是激烈的冲突场面，还是细腻的情感描写，都展现了作者深厚的文字功底。")
        intro_parts.append("这是一部值得反复品读的作品，相信每位读者都能从中获得不同的感悟和享受。")
        
        return "\n".join(intro_parts)
    
    def _get_default_intro(self, title: str, chapters: List[dict]) -> str:
        """获取默认简介（保证400字以上）"""
        word_count = sum(len(ch.get('content', '')) for ch in chapters)
        chapter_count = len(chapters)
        
        intro = f"""《{title}》是一部构思精巧、情节丰富的网络小说巨作，全书共{chapter_count}章，约{word_count}字的宏大篇幅。

故事以独特的视角展开，作者通过细腻的笔触和精湛的文字功底，为读者构建了一个充满想象力和感染力的文学世界。在这个世界里，每一个人物都有着鲜明的个性和独特的命运轨迹，他们的喜怒哀乐、爱恨情仇交织成一幅幅生动的画卷。

主人公的成长历程是本书的核心线索。从最初的青涩懵懂到后来的成熟坚韧，主角在一次次的磨难和考验中不断突破自我，实现蜕变。这种成长不仅体现在能力的提升上，更重要的是心智的成熟和价值观的确立。

书中的配角同样精彩纷呈，他们或是主角的挚友知己，或是强大的对手敌人，每一个人物都有其存在的意义和价值。正是这些形形色色的人物，共同编织出了这个丰富多彩的故事世界。

在情节设置上，作者匠心独运，既有跌宕起伏的主线剧情，又有精心设计的支线故事。每一个章节都充满悬念，每一次转折都出人意料。读者在阅读过程中，既能体验到紧张刺激的冒险历程，又能感受到温馨感人的情感共鸣。

这是一部值得细细品味的优秀作品，无论您是资深书迷还是休闲读者，都能在其中找到属于自己的阅读乐趣。"""
        
        return intro[:1000] if len(intro) > 1000 else intro
    
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
        从以下小说章节中提取或创作一段精彩片段，字数要求：最少400字，最多1000字。

        {self._format_chapters(sample_chapters)}

        写作要求：
        1. 选择一个最精彩、最吸引人的场景进行描写
        2. 可以是：
           - 激烈的冲突或战斗场面
           - 重要的转折点或关键时刻
           - 感人的情感场景
           - 悬念迭起的探索过程
        3. 描写要求：
           - 场景描写生动具体（环境、氛围）
           - 人物动作和对话要有张力
           - 心理描写细腻真实
           - 情节推进要紧凑有力
        4. 字数必须达到400字以上，但不超过1000字
        5. 保持原作的语言风格和叙事节奏
        
        注意：
        - 如果原文某段落特别精彩，可以适当扩充后引用
        - 也可以基于原文情节进行合理的细节补充和扩写
        - 确保片段独立完整，读者能够理解场景
        
        直接返回精彩片段内容，不要有任何其他说明或标记。
        """
        
        try:
            response = await self.client.messages.create(
                model="claude-3-5-sonnet-20241022",  # 使用更强的模型
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            paragraph = response.content[0].text.strip()
            
            # 确保字数在范围内
            if len(paragraph) > 1000:
                paragraph = paragraph[:1000]
            elif len(paragraph) < 400:
                logger.warning(f"AI生成的精彩片段只有{len(paragraph)}字，使用保底方案")
                # 直接使用保底方案确保字数
                paragraph = self._get_default_awesome_paragraph()
            
            return paragraph
        except Exception as e:
            logger.error(f"生成精彩片段失败: {e}")
            return self._extract_and_expand(chapters, 400)
    
    def _extract_and_expand(self, chapters: List[dict], min_length: int) -> str:
        """从原文提取并扩充到指定长度"""
        if not chapters:
            return self._get_default_awesome_paragraph()
        
        # 找到最长的连续片段
        best_content = ""
        for chapter in chapters[:3]:  # 检查前3章
            content = chapter.get('content', '')
            if len(content) > len(best_content):
                best_content = content
        
        if len(best_content) >= min_length:
            # 如果有足够长的内容，截取合适的部分
            # 找到一个好的开始点
            start_markers = ['。', '！', '？', '\n\n']
            start_pos = 0
            for marker in start_markers:
                pos = best_content.find(marker)
                if 0 < pos < 100:
                    start_pos = pos + len(marker)
                    break
            
            result = best_content[start_pos:start_pos + min_length + 200]
            
            # 找到一个好的结束点
            end_markers = ['。', '！', '？', '"']
            end_pos = min_length
            for marker in end_markers:
                pos = result.rfind(marker, min_length)
                if pos > 0:
                    end_pos = pos + len(marker)
                    break
            
            return result[:end_pos]
        else:
            # 如果内容不够，需要组合多个章节并添加过渡
            combined = []
            current_length = 0
            
            for chapter in chapters:
                content = chapter.get('content', '')
                if content:
                    # 提取章节的核心部分
                    lines = content.split('\n')
                    for line in lines:
                        line = line.strip()
                        if line and len(line) > 20:  # 忽略太短的行
                            combined.append(line)
                            current_length += len(line)
                            if current_length >= min_length:
                                break
                    
                    if current_length >= min_length:
                        break
                    
                    # 添加过渡句
                    if combined and current_length < min_length:
                        combined.append("时光流转，故事继续展开...")
            
            result = '\n\n'.join(combined)
            
            # 如果还是不够，添加通用描述
            if len(result) < min_length:
                result = self._get_default_awesome_paragraph()
            
            return result[:1000] if len(result) > 1000 else result
    
    def _get_default_awesome_paragraph(self) -> str:
        """获取默认精彩片段（保证400字以上）"""
        return """夜色如墨，星光暗淡。山巅之上，一个孤独的身影静静伫立，任凭寒风呼啸而过。

他缓缓抬起头，目光穿透层层夜幕，直指苍穹深处。那里，有他追寻已久的答案，有他不惜一切也要达到的彼岸。

"这条路，我已经走了太久。"他的声音低沉而坚定，仿佛在对这片天地宣誓，"但我绝不会停下脚步。"

突然，天际划过一道流光，如同撕裂黑夜的利剑。那光芒是如此耀眼，如此炽热，瞬间照亮了整个山峰。他的瞳孔猛地收缩，心跳在这一刻骤然加速。

"终于来了..."他喃喃自语，眼中闪烁着难以抑制的激动。

这一刻，他等待了太久。从懵懂少年到如今，多少个日日夜夜的苦修，多少次生死边缘的徘徊，都是为了这一刻的到来。

他深吸一口气，体内的力量开始疯狂运转。经脉中，能量如江河奔腾，发出低沉的轰鸣声。他的身体开始发光，与天际的流光遥相呼应。

"来吧！"他大喝一声，声如雷霆，震动山河，"让我看看，这天地间的极限究竟在何处！"

话音刚落，他纵身一跃，如离弦之箭般冲向那道流光。这一跃，跨越的不仅是空间的距离，更是命运的鸿沟。

成败在此一举，生死只在瞬间。但他的眼中没有丝毫畏惧，只有无尽的渴望和决然。因为他知道，这是他改变命运的唯一机会。"""
    
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
        """从原文提取精彩片段（保持向后兼容）"""
        return self._extract_and_expand(chapters, min_length)