"""
文本清理和格式化服务
提供各种文本清理、格式化和优化功能
"""
import re
from typing import Optional, List, Dict, Any
import unicodedata
import logging

logger = logging.getLogger(__name__)

class TextStripService:
    """文本清理专家服务"""
    
    def __init__(self):
        """初始化文本清理服务"""
        # 定义各种清理规则
        self.punctuation_patterns = {
            'chinese': r'[。，、；：？！""''（）《》【】……——]',
            'english': r'[.,;:?!\'"()\[\]{}<>]',
            'special': r'[@#$%^&*+=|\\~`]'
        }
        
    def strip_basic(self, text: str) -> str:
        """基础清理：去除首尾空白"""
        return text.strip() if text else ""
    
    def strip_all_whitespace(self, text: str) -> str:
        """去除所有空白字符（包括中间的）"""
        return re.sub(r'\s+', '', text)
    
    def strip_extra_whitespace(self, text: str) -> str:
        """将多个空白字符合并为单个空格"""
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def strip_empty_lines(self, text: str) -> str:
        """去除空行"""
        lines = [line for line in text.split('\n') if line.strip()]
        return '\n'.join(lines)
    
    def strip_duplicate_lines(self, text: str) -> str:
        """去除重复行"""
        seen = set()
        lines = []
        for line in text.split('\n'):
            if line not in seen:
                seen.add(line)
                lines.append(line)
        return '\n'.join(lines)
    
    def strip_html_tags(self, text: str) -> str:
        """去除HTML标签"""
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)
    
    def strip_markdown(self, text: str, keep_text: bool = True) -> str:
        """
        去除Markdown格式
        
        Args:
            text: 输入文本
            keep_text: 是否保留纯文本内容
        """
        if not keep_text:
            return ""
        
        # 去除标题标记
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        # 去除粗体和斜体
        text = re.sub(r'\*{1,3}([^\*]+)\*{1,3}', r'\1', text)
        text = re.sub(r'_{1,3}([^_]+)_{1,3}', r'\1', text)
        # 去除链接
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        # 去除图片
        text = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', '', text)
        # 去除代码块
        text = re.sub(r'```[^`]*```', '', text, flags=re.DOTALL)
        text = re.sub(r'`([^`]+)`', r'\1', text)
        # 去除引用
        text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)
        # 去除列表标记
        text = re.sub(r'^[\*\-\+]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
        # 去除分割线
        text = re.sub(r'^[\*\-_]{3,}$', '', text, flags=re.MULTILINE)
        
        return self.strip_extra_whitespace(text)
    
    def strip_punctuation(self, text: str, types: List[str] = ['chinese', 'english']) -> str:
        """
        去除标点符号
        
        Args:
            text: 输入文本
            types: 要去除的标点类型 ['chinese', 'english', 'special']
        """
        for ptype in types:
            if ptype in self.punctuation_patterns:
                text = re.sub(self.punctuation_patterns[ptype], '', text)
        return text
    
    def strip_numbers(self, text: str, keep_chinese_numbers: bool = False) -> str:
        """
        去除数字
        
        Args:
            text: 输入文本
            keep_chinese_numbers: 是否保留中文数字
        """
        # 去除阿拉伯数字
        text = re.sub(r'\d+', '', text)
        
        # 如果需要，去除中文数字
        if not keep_chinese_numbers:
            text = re.sub(r'[零一二三四五六七八九十百千万亿壹贰叁肆伍陆柒捌玖拾佰仟萬億]', '', text)
        
        return text
    
    def strip_special_characters(self, text: str, keep_chars: str = "") -> str:
        """
        去除特殊字符，只保留中文、英文、数字
        
        Args:
            text: 输入文本
            keep_chars: 额外要保留的字符
        """
        # 保留中文、英文、数字和指定字符
        if keep_chars:
            pattern = f'[^\\u4e00-\\u9fa5a-zA-Z0-9{re.escape(keep_chars)}]'
        else:
            pattern = '[^\\u4e00-\\u9fa5a-zA-Z0-9]'
        return re.sub(pattern, '', text)
    
    def strip_invisible_chars(self, text: str) -> str:
        """去除不可见字符（零宽字符等）"""
        # 去除零宽字符
        text = re.sub(r'[\u200b\u200c\u200d\ufeff]', '', text)
        # 去除其他控制字符
        text = ''.join(char for char in text if unicodedata.category(char)[0] != 'C')
        return text
    
    def strip_emoji(self, text: str) -> str:
        """去除emoji表情"""
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "]+", 
            flags=re.UNICODE
        )
        return emoji_pattern.sub('', text)
    
    def strip_urls(self, text: str) -> str:
        """去除URL链接"""
        url_pattern = r'https?://[^\s]+'
        return re.sub(url_pattern, '', text)
    
    def strip_email(self, text: str) -> str:
        """去除邮箱地址"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return re.sub(email_pattern, '', text)
    
    def strip_chapter_numbers(self, text: str) -> str:
        """去除章节编号"""
        # 匹配各种章节格式
        patterns = [
            r'^第[零一二三四五六七八九十百千万\d]+章\s*',
            r'^Chapter\s+\d+\s*',
            r'^\d+\.\s*',
            r'^第\d+节\s*',
            r'^第[零一二三四五六七八九十百千万]+节\s*'
        ]
        
        for pattern in patterns:
            text = re.sub(pattern, '', text, flags=re.MULTILINE | re.IGNORECASE)
        
        return text
    
    def normalize_quotes(self, text: str) -> str:
        """标准化引号"""
        # 将各种引号统一
        text = re.sub(r'[""]', '"', text)
        text = re.sub(r'['']', "'", text)
        text = re.sub(r'「|」', '"', text)
        text = re.sub(r'『|』', '"', text)
        return text
    
    def normalize_punctuation(self, text: str) -> str:
        """标准化标点符号"""
        # 中文标点转英文
        replacements = {
            '，': ',',
            '。': '.',
            '！': '!',
            '？': '?',
            '；': ';',
            '：': ':',
            '（': '(',
            '）': ')',
            '【': '[',
            '】': ']',
            '、': ',',
            '…': '...',
            '——': '--'
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def smart_strip(self, text: str, options: Dict[str, Any] = None) -> str:
        """
        智能清理文本
        
        Args:
            text: 输入文本
            options: 清理选项
                - strip_whitespace: 清理空白
                - strip_html: 清理HTML
                - strip_markdown: 清理Markdown
                - strip_punctuation: 清理标点
                - strip_urls: 清理URL
                - strip_emoji: 清理表情
                - normalize: 标准化文本
        """
        if not text:
            return ""
        
        options = options or {
            'strip_whitespace': True,
            'strip_html': True,
            'strip_markdown': False,
            'strip_punctuation': False,
            'strip_urls': True,
            'strip_emoji': True,
            'normalize': True
        }
        
        # 按顺序处理
        if options.get('strip_html'):
            text = self.strip_html_tags(text)
        
        if options.get('strip_markdown'):
            text = self.strip_markdown(text)
        
        if options.get('strip_urls'):
            text = self.strip_urls(text)
        
        if options.get('strip_emoji'):
            text = self.strip_emoji(text)
        
        if options.get('strip_punctuation'):
            text = self.strip_punctuation(text)
        
        if options.get('normalize'):
            text = self.normalize_quotes(text)
        
        if options.get('strip_whitespace'):
            text = self.strip_extra_whitespace(text)
            text = self.strip_empty_lines(text)
        
        # 最后清理不可见字符
        text = self.strip_invisible_chars(text)
        
        return text
    
    def extract_clean_text(self, text: str) -> str:
        """
        提取干净的文本内容（用于小说正文）
        """
        # 去除所有格式和多余内容
        text = self.strip_html_tags(text)
        text = self.strip_markdown(text, keep_text=True)
        text = self.strip_urls(text)
        text = self.strip_email(text)
        text = self.strip_emoji(text)
        text = self.strip_invisible_chars(text)
        text = self.strip_extra_whitespace(text)
        text = self.strip_empty_lines(text)
        
        return text
    
    def prepare_for_publishing(self, text: str) -> str:
        """
        为发布准备文本（保留必要格式）
        """
        # 轻度清理，保留段落结构
        text = self.strip_invisible_chars(text)
        text = self.strip_extra_whitespace(text)
        text = self.normalize_quotes(text)
        
        # 确保段落之间有适当间隔
        paragraphs = text.split('\n\n')
        cleaned_paragraphs = []
        
        for para in paragraphs:
            para = para.strip()
            if para:
                # 确保段落开头有缩进
                if not para.startswith('　　'):
                    para = '　　' + para
                cleaned_paragraphs.append(para)
        
        return '\n\n'.join(cleaned_paragraphs)
    
    def get_stats(self, text: str) -> Dict[str, int]:
        """
        获取文本统计信息
        """
        clean_text = self.extract_clean_text(text)
        
        return {
            'total_chars': len(text),
            'clean_chars': len(clean_text),
            'chinese_chars': len(re.findall(r'[\u4e00-\u9fa5]', clean_text)),
            'english_chars': len(re.findall(r'[a-zA-Z]', clean_text)),
            'numbers': len(re.findall(r'\d', clean_text)),
            'lines': len(text.split('\n')),
            'paragraphs': len([p for p in text.split('\n\n') if p.strip()]),
            'words': len(clean_text.split())
        }


# 创建全局实例
text_strip_service = TextStripService()


# 便捷函数
def strip_text(text: str, strip_type: str = 'basic') -> str:
    """
    便捷的文本清理函数
    
    Args:
        text: 输入文本
        strip_type: 清理类型
            - 'basic': 基础清理
            - 'clean': 提取干净文本
            - 'publish': 准备发布
            - 'smart': 智能清理
    """
    if strip_type == 'basic':
        return text_strip_service.strip_basic(text)
    elif strip_type == 'clean':
        return text_strip_service.extract_clean_text(text)
    elif strip_type == 'publish':
        return text_strip_service.prepare_for_publishing(text)
    elif strip_type == 'smart':
        return text_strip_service.smart_strip(text)
    else:
        return text_strip_service.strip_basic(text)