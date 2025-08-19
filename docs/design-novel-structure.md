# 小说发布数据结构化系统设计文档

## 1. 项目概述

### 1.1 需求背景
需要将Markdown格式的小说文件（如`female_romance_final.md`）结构化为符合微信读书平台发布接口的JSON格式，并提供人工审核预览界面，支持编辑和保存。

### 1.2 核心功能
- 自动解析Markdown小说文件，提取结构化数据
- 调用Claude API生成精彩片段和补充元数据
- 提供Web界面供审核员预览和编辑
- 支持修改内容并保存回原文件
- 一键发布到微信读书平台

## 2. 系统架构

### 2.1 技术栈选型
- **后端**: Python + FastAPI
- **前端**: React + TypeScript + Tailwind CSS
- **数据处理**: Python-Markdown / mistune (解析Markdown)
- **AI集成**: Anthropic Claude API
- **状态管理**: Zustand
- **UI组件**: Ant Design / Shadcn UI
- **异步处理**: asyncio + aiofiles
- **数据验证**: Pydantic

### 2.2 系统组件
```
┌─────────────────────────────────────────┐
│         前端预览编辑界面                  │
│  (React + TypeScript + Tailwind CSS)     │
└─────────────┬───────────────────────────┘
              │ HTTP API (REST + WebSocket)
┌─────────────▼───────────────────────────┐
│         后端服务 (FastAPI)                │
│  ┌──────────────────────────────────┐   │
│  │  数据提取模块 (NovelParser)       │   │
│  ├──────────────────────────────────┤   │
│  │  Claude API 集成模块              │   │
│  ├──────────────────────────────────┤   │
│  │  文件管理模块 (FileManager)       │   │
│  ├──────────────────────────────────┤   │
│  │  发布服务集成模块                 │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 3. 数据结构设计

### 3.1 输入文件格式分析
基于`female_romance_final.md`文件结构：
```markdown
# 女频小说初稿
# 霸总的意外新娘：一夜缠绵后我怀了他的崽  // 第3行：作品标题
## 第一章 春药误食，霸总中招           // 章节标题
章节内容...
## 第二章 童子身被破，全城追凶
章节内容...
```

### 3.2 目标数据结构（Pydantic模型）
```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Chapter(BaseModel):
    chapterTitle: str = Field(..., description="章节标题")
    chapterContent: str = Field(..., description="章节内容")

class Metadata(BaseModel):
    sourceFile: str = Field(..., description="源文件路径")
    parseTime: datetime = Field(default_factory=datetime.now, description="解析时间")
    wordCount: int = Field(..., description="总字数")
    chapterCount: int = Field(..., description="章节数")

class PublicationData(BaseModel):
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
    
    # 章节列表
    chapterList: List[Chapter] = Field(..., description="章节列表")
    
    # 元数据（内部使用）
    metadata: Optional[Metadata] = Field(None, description="元数据")
```

### 3.3 分类映射规则
```python
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
```

## 4. 功能模块设计

### 4.1 数据提取模块
```python
import re
from typing import List, Tuple
import mistune
from pathlib import Path

class NovelParser:
    def __init__(self):
        self.markdown = mistune.create_markdown()
    
    async def parse_markdown(self, file_path: str) -> dict:
        """解析Markdown文件"""
        content = await self.read_file(file_path)
        title = self.extract_title(content)
        chapters = self.extract_chapters(content)
        stats = self.calculate_stats(content)
        return {
            "title": title,
            "chapters": chapters,
            "stats": stats
        }
    
    def extract_title(self, content: str) -> str:
        """提取标题（第3行）"""
        lines = content.split('\n')
        if len(lines) >= 3:
            # 移除Markdown标题符号
            return lines[2].strip().replace('#', '').strip()
        return "未命名作品"
    
    def extract_chapters(self, content: str) -> List[dict]:
        """提取章节列表"""
        chapters = []
        pattern = r'^##\s+(.+?)$'
        lines = content.split('\n')
        
        current_title = None
        current_content = []
        
        for line in lines:
            if re.match(pattern, line):
                if current_title:
                    chapters.append({
                        "chapterTitle": current_title,
                        "chapterContent": '\n'.join(current_content).strip()
                    })
                current_title = re.match(pattern, line).group(1)
                current_content = []
            elif current_title:
                current_content.append(line)
        
        # 添加最后一章
        if current_title:
            chapters.append({
                "chapterTitle": current_title,
                "chapterContent": '\n'.join(current_content).strip()
            })
        
        return chapters
    
    def calculate_stats(self, content: str) -> dict:
        """计算统计信息"""
        # 移除Markdown标记计算实际字数
        text = re.sub(r'[#*`\[\]()]', '', content)
        return {
            "wordCount": len(text.replace(' ', '').replace('\n', '')),
            "chapterCount": len(re.findall(r'^##\s+', content, re.MULTILINE))
        }
```

### 4.2 Claude API集成模块
```python
from anthropic import AsyncAnthropic
from typing import List, Optional, Dict
import asyncio
import json

class ClaudeService:
    def __init__(self, api_key: str):
        self.client = AsyncAnthropic(api_key=api_key)
    
    async def generate_all_metadata(self, title: str, chapters: List[dict]) -> Dict:
        """一次性生成所有需要的元数据"""
        sample_content = self._get_sample_content(chapters)
        
        prompt = f"""
        基于以下小说内容，生成完整的作品元数据。

        标题：{title}
        内容样本：{sample_content}

        请生成以下信息，以JSON格式返回：
        {{
            "intro": "作品简介（200-300字，突出故事核心冲突和人物关系）",
            "author": "作者笔名（根据作品风格生成合适的笔名）",
            "firstCategory": "一级分类（女频/男频）",
            "secondCategory": "二级分类（如：现代言情、古代言情、都市、玄幻等）",
            "thirdCategory": "三级分类（如：豪门总裁、都市生活、东方玄幻等）",
            "awesomeParagraph": "精彩片段（400-1000字，选择最吸引人的情节片段，保持原文风格）"
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
        
        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # 解析返回的JSON
        try:
            metadata = json.loads(response.content[0].text)
            return metadata
        except json.JSONDecodeError:
            # 如果解析失败，分别调用各个方法
            return await self._generate_metadata_separately(title, chapters)
    
    async def _generate_metadata_separately(self, title: str, chapters: List[dict]) -> Dict:
        """分别生成各项元数据（降级方案）"""
        tasks = [
            self.generate_intro(title, chapters),
            self.generate_author(title, chapters),
            self.generate_categories(title, chapters),
            self.generate_awesome_paragraph(chapters)
        ]
        
        results = await asyncio.gather(*tasks)
        
        return {
            "intro": results[0],
            "author": results[1],
            **results[2],  # categories返回的是字典
            "awesomeParagraph": results[3]
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
        
        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()
    
    async def generate_author(self, title: str, chapters: List[dict]) -> str:
        """生成作者笔名"""
        sample_content = chapters[0]['chapterContent'][:500] if chapters else ""
        
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
        
        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=50,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()
    
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
        
        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        
        try:
            return json.loads(response.content[0].text)
        except json.JSONDecodeError:
            # 默认分类
            return {
                "firstCategory": "女频",
                "secondCategory": "现代言情",
                "thirdCategory": "都市生活"
            }
    
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
        
        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
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
    
    def _get_sample_content(self, chapters: List[dict], max_chapters: int = 5) -> str:
        """获取章节样本内容"""
        sample_chapters = chapters[:max_chapters] if len(chapters) > max_chapters else chapters
        samples = []
        for ch in sample_chapters:
            content = ch['chapterContent'][:1000] if len(ch['chapterContent']) > 1000 else ch['chapterContent']
            samples.append(f"【{ch['chapterTitle']}】\n{content}")
        return '\n\n'.join(samples)
    
    def _format_chapters(self, chapters: List[dict]) -> str:
        """格式化章节内容"""
        formatted = []
        for ch in chapters:
            formatted.append(f"【{ch['chapterTitle']}】\n{ch['chapterContent'][:1500]}")
        return '\n\n'.join(formatted)
    
    def _extract_from_original(self, chapters: List[dict], min_length: int) -> str:
        """从原文提取精彩片段"""
        # 查找对话或冲突场景
        for chapter in chapters:
            content = chapter['chapterContent']
            # 查找包含对话的段落
            if '"' in content or '！' in content or '？' in content:
                start = content.find('"')
                if start > 0:
                    excerpt = content[max(0, start-100):min(len(content), start+min_length)]
                    if len(excerpt) >= min_length:
                        return excerpt
        
        # 如果没找到，返回第一章的开头
        if chapters:
            return chapters[0]['chapterContent'][:min_length]
        
        return ""
```

### 4.3 文件管理模块
```python
import aiofiles
import json
from pathlib import Path
from datetime import datetime
import shutil

class FileManager:
    def __init__(self, base_path: str = "./data"):
        self.base_path = Path(base_path)
        self.backup_path = self.base_path / "backups"
        self.backup_path.mkdir(parents=True, exist_ok=True)
    
    async def read_novel_file(self, file_path: str) -> str:
        """异步读取Markdown文件"""
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            content = await f.read()
        return content
    
    async def save_novel_file(self, file_path: str, data: PublicationData) -> None:
        """保存修改后的内容回MD文件"""
        # 先备份原文件
        await self.backup_file(file_path)
        
        # 重构MD内容
        content = self._reconstruct_markdown(data)
        
        async with aiofiles.open(file_path, 'w', encoding='utf-8') as f:
            await f.write(content)
    
    def _reconstruct_markdown(self, data: PublicationData) -> str:
        """将结构化数据重构为Markdown格式"""
        lines = [
            "# 女频小说初稿",
            "",
            f"# {data.title}",
            ""
        ]
        
        for chapter in data.chapterList:
            lines.append(f"## {chapter.chapterTitle}")
            lines.append("")
            lines.append(chapter.chapterContent)
            lines.append("")
        
        return '\n'.join(lines)
    
    async def export_json(self, data: PublicationData) -> str:
        """导出JSON格式"""
        return data.json(ensure_ascii=False, indent=2)
    
    async def backup_file(self, file_path: str) -> str:
        """备份原文件"""
        source = Path(file_path)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{source.stem}_{timestamp}{source.suffix}"
        backup_file = self.backup_path / backup_name
        
        shutil.copy2(source, backup_file)
        return str(backup_file)
```

## 5. FastAPI接口设计

### 5.1 API路由定义
```python
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

app = FastAPI(title="小说发布结构化系统", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求模型
class ParseOptions(BaseModel):
    generateIntro: bool = True
    generateAwesomeParagraph: bool = True
    autoCategories: bool = True

class ParseRequest(BaseModel):
    filePath: str
    options: Optional[ParseOptions] = ParseOptions()

class UpdateRequest(BaseModel):
    filePath: str
    data: PublicationData

class GenerateRequest(BaseModel):
    chapters: List[Chapter]
    minLength: int = 400
    maxLength: int = 1000

class PublishRequest(BaseModel):
    data: PublicationData
    platform: str = "wechat"
```

### 5.2 API端点实现
```python
@app.post("/api/novel/parse", response_model=PublicationData)
async def parse_novel(request: ParseRequest):
    """解析小说文件并生成结构化数据"""
    try:
        # 解析文件
        parser = NovelParser()
        raw_data = await parser.parse_markdown(request.filePath)
        
        # 初始化Claude服务
        claude = ClaudeService(api_key=settings.ANTHROPIC_API_KEY)
        
        # 一次性生成所有元数据（优化API调用）
        metadata = await claude.generate_all_metadata(
            raw_data["title"],
            raw_data["chapters"]
        )
        
        # 构建完整的发布数据
        publication_data = {
            "title": raw_data["title"],
            "intro": metadata["intro"],
            "author": metadata["author"],
            "firstCategory": metadata["firstCategory"],
            "secondCategory": metadata["secondCategory"],
            "thirdCategory": metadata["thirdCategory"],
            "awesomeParagraph": metadata["awesomeParagraph"],
            "completeStatus": 2,
            "chapterList": raw_data["chapters"],
            "metadata": {
                "sourceFile": request.filePath,
                "wordCount": raw_data["stats"]["wordCount"],
                "chapterCount": raw_data["stats"]["chapterCount"],
                "parseTime": datetime.now()
            }
        }
        
        return PublicationData(**publication_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/novel/update")
async def update_novel(request: UpdateRequest):
    """更新小说数据并保存"""
    try:
        file_manager = FileManager()
        await file_manager.save_novel_file(request.filePath, request.data)
        return {"success": True, "message": "文件已更新"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/novel/generate-paragraph")
async def generate_paragraph(request: GenerateRequest):
    """生成精彩片段"""
    try:
        claude = ClaudeService(api_key=settings.ANTHROPIC_API_KEY)
        paragraph = await claude.generate_awesome_paragraph(request.chapters)
        
        # 确保字数在要求范围内
        if len(paragraph) < request.minLength or len(paragraph) > request.maxLength:
            # 重新生成或裁剪
            paragraph = paragraph[:request.maxLength]
        
        return {"awesomeParagraph": paragraph}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/novel/publish")
async def publish_novel(request: PublishRequest):
    """发布到指定平台"""
    try:
        import httpx
        import hashlib
        from datetime import datetime
        
        # 生成签名
        date = datetime.now().strftime("%Y%m%d")
        signature = hashlib.md5(f"{date}aiGenerateBook".encode()).hexdigest()
        
        # 准备发布数据
        publish_data = request.data.dict(exclude={"metadata"})
        
        # 发送请求
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://wxrd.alongmen.com/book/v1/uploadBookInfo",
                json=publish_data,
                headers={"X-Signature": signature}
            )
        
        if response.status_code == 200:
            return {"success": True, "response": response.json()}
        else:
            raise HTTPException(status_code=response.status_code, detail="发布失败")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/novel/upload")
async def upload_novel(file: UploadFile = File(...)):
    """上传小说文件"""
    try:
        # 保存上传的文件
        file_path = f"./uploads/{file.filename}"
        content = await file.read()
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        return {"filePath": file_path, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/novel/preview/{file_id}")
async def preview_novel(file_id: str):
    """预览小说数据"""
    # 实现预览逻辑
    pass

# WebSocket支持实时更新
from fastapi import WebSocket

@app.websocket("/ws/novel/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # 处理实时编辑
            await websocket.send_text(f"已保存: {data}")
    except Exception as e:
        await websocket.close()
```

## 6. 前端界面设计

### 6.1 页面布局
```
┌──────────────────────────────────────────────┐
│              小说发布预览系统                   │
├──────────────────────────────────────────────┤
│  ┌─────────────┐  ┌───────────────────────┐  │
│  │   侧边栏     │  │      预览区域          │  │
│  │             │  │                       │  │
│  │ • 基础信息   │  │  标题: [可编辑]        │  │
│  │ • 分类设置   │  │  作者: [可编辑]        │  │
│  │ • 章节列表   │  │  简介: [可编辑文本框]   │  │
│  │ • 精彩片段   │  │                       │  │
│  │             │  │  分类: [下拉选择]       │  │
│  │             │  │                       │  │
│  │ [解析文件]   │  │  精彩片段:             │  │
│  │ [生成内容]   │  │  [可编辑文本框]        │  │
│  │ [保存修改]   │  │                       │  │
│  │ [发布作品]   │  │  章节预览:             │  │
│  │             │  │  [章节列表展示]        │  │
│  └─────────────┘  └───────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 6.2 核心组件
```typescript
// 主应用组件
interface NovelEditorProps {
  initialData?: PublicationData;
  onSave: (data: PublicationData) => void;
  onPublish: (data: PublicationData) => void;
}

// 基础信息编辑组件
interface BasicInfoEditorProps {
  title: string;
  author: string;
  intro: string;
  onChange: (field: string, value: string) => void;
}

// 分类选择组件
interface CategorySelectorProps {
  firstCategory: string;
  secondCategory: string;
  thirdCategory: string;
  onChange: (level: string, value: string) => void;
}

// 精彩片段编辑器
interface AwesomeParagraphEditorProps {
  content: string;
  onChange: (content: string) => void;
  onGenerate: () => void;
}

// 章节列表预览
interface ChapterListViewProps {
  chapters: Chapter[];
  onEdit: (index: number, chapter: Chapter) => void;
}
```

## 7. 工作流程

### 7.1 数据处理流程
```
1. 用户选择Markdown文件
   ↓
2. 系统解析文件结构
   - 提取标题（第3行）
   - 提取章节列表
   - 计算字数统计
   ↓
3. 调用Claude API
   - 生成作品简介
   - 生成精彩片段（400-1000字）
   - 智能分类建议
   ↓
4. 展示预览界面
   - 显示所有结构化数据
   - 支持实时编辑
   ↓
5. 人工审核和修改
   - 调整分类
   - 编辑简介
   - 修改精彩片段
   ↓
6. 保存或发布
   - 保存回MD文件
   - 发布到微信读书
```

### 7.2 Claude API调用策略
```python
# 生成精彩片段的Prompt模板
AWESOME_PARAGRAPH_PROMPT = """
基于以下小说内容，生成一段400-1000字的精彩片段：

标题：{title}
章节内容：{chapters}

要求：
1. 选择最吸引人的情节片段
2. 保持原文风格和语言特色
3. 字数控制在400-1000字之间
4. 能够吸引读者继续阅读
5. 避免剧透关键情节

请直接返回精彩片段内容，不需要其他说明。
"""

# 智能分类的Prompt模板
CATEGORY_PROMPT = """
分析以下小说内容，确定其分类：

标题：{title}
内容摘要：{summary}

请根据内容特征，返回以下格式的分类：
{
  "firstCategory": "女频/男频",
  "secondCategory": "具体类型",
  "thirdCategory": "细分类型"
}

可选分类参考：
女频：现代言情（豪门总裁、都市生活、婚恋情缘）
     古代言情（宫廷侯爵、古典架空、穿越奇情）
男频：都市（都市生活、异术超能）
     玄幻（东方玄幻、异世大陆）
"""

# 生成作品简介的Prompt模板
INTRO_PROMPT = """
基于以下小说信息生成200-300字的作品简介：

标题：{title}
内容样本：{sample_content}

要求：
1. 突出故事核心冲突
2. 介绍主要人物关系
3. 设置悬念吸引读者
4. 语言简洁有吸引力
5. 不要剧透结局

请直接返回简介内容。
"""
```

## 8. 部署方案

### 8.1 本地运行部署

#### 后端启动
```bash
# 1. 创建虚拟环境
python -m venv venv

# 2. 激活虚拟环境
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 创建必要目录
mkdir -p data/backups uploads

# 5. 启动FastAPI服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端启动
```bash
# 1. 进入前端目录
cd client

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

### 8.2 requirements.txt
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
aiofiles==23.2.1
httpx==0.25.2
anthropic==0.7.7
mistune==3.0.2
python-dotenv==1.0.0
```

### 8.3 环境变量配置 (.env文件)
```env
# API配置
ANTHROPIC_API_KEY=your_api_key
PORT=8000

# 文件路径
NOVEL_DIR=./data/novels
BACKUP_DIR=./data/backups

# 发布配置
PUBLISH_ENDPOINT=https://wxrd.alongmen.com/book/v1/uploadBookInfo
PUBLISH_SECRET=aiGenerateBook

# 日志配置
LOG_LEVEL=INFO
```

### 8.4 生产环境部署
```bash
# 使用PM2管理Python进程（需先安装Node.js和PM2）
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name novel-api

# 或使用supervisor
[program:novel-api]
command=/path/to/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
directory=/path/to/project
autostart=true
autorestart=true
```

## 9. 测试计划

### 9.1 单元测试
- 文件解析功能测试
- 数据提取准确性测试
- API接口测试

### 9.2 集成测试
- Claude API集成测试
- 文件保存和恢复测试
- 发布流程测试

### 9.3 用户验收测试
- 界面操作流畅性
- 数据编辑和保存
- 发布成功率

## 10. 后续优化

### 10.1 功能增强
- 批量处理多个小说文件
- 历史版本管理
- 多平台发布支持
- AI写作建议

### 10.2 性能优化
- 大文件分块处理
- Claude API调用缓存
- 前端懒加载

### 10.3 用户体验
- 实时预览效果
- 快捷键支持
- 自动保存草稿
- 导出多种格式

## 11. 风险和应对

### 11.1 技术风险
- **风险**：Claude API调用失败
- **应对**：实现重试机制和降级方案

### 11.2 数据风险
- **风险**：文件修改错误
- **应对**：自动备份原文件

### 11.3 安全风险
- **风险**：未授权访问
- **应对**：实现用户认证和权限控制

---

## 附录：项目结构

```
novel-publication/
├── backend/                       # 后端FastAPI应用
│   ├── main.py                   # FastAPI主入口
│   ├── models/                   # Pydantic数据模型
│   │   ├── __init__.py
│   │   └── publication.py        # 发布数据模型
│   ├── services/                 # 业务逻辑服务
│   │   ├── __init__.py
│   │   ├── parser.py            # Markdown解析服务
│   │   ├── claude_service.py    # Claude API服务
│   │   └── file_manager.py      # 文件管理服务
│   ├── routers/                  # API路由
│   │   ├── __init__.py
│   │   └── novel.py             # 小说相关路由
│   ├── config/                   # 配置文件
│   │   ├── __init__.py
│   │   └── settings.py          # 环境配置
│   ├── requirements.txt         # Python依赖
│   └── .env                     # 环境变量
├── client/                       # 前端React应用
│   ├── src/
│   │   ├── App.tsx              # 主应用组件
│   │   ├── components/          # React组件
│   │   │   ├── NovelEditor.tsx  # 小说编辑器
│   │   │   ├── PreviewPanel.tsx # 预览面板
│   │   │   └── CategorySelector.tsx # 分类选择器
│   │   ├── services/            # API服务
│   │   │   └── api.ts           # API调用封装
│   │   └── stores/              # 状态管理
│   │       └── novelStore.ts    # 小说数据状态
│   ├── package.json
│   └── tsconfig.json
├── data/                         # 数据目录
│   ├── novels/                  # 小说文件
│   └── backups/                 # 备份文件
├── docs/                         # 文档目录
│   ├── 闺蜜原文-20250814_162657/
│   │   └── female_romance_final.md
│   └── design-novel-structure.md # 本设计文档
└── uploads/                      # 上传文件临时目录
```