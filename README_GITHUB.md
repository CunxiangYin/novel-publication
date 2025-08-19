# 📚 Novel Publication System

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)

[English](#english) | [中文](#中文)

</div>

## English

### 🎯 Overview

A comprehensive web application that converts Markdown-formatted novels into structured data for publishing platforms, featuring AI-powered metadata generation using Claude API.

### ✨ Key Features

- 📖 **Smart Parsing** - Automatically parse Markdown files, extract titles, chapters, and word counts
- 🤖 **AI Generation** - Generate metadata using Claude API:
  - Book introductions (200-300 words)
  - Author pen names (2-4 Chinese characters)
  - Smart categorization (3-level hierarchy)
  - Highlight excerpts (400-1000 words)
- ✏️ **Online Editing** - Modern React interface with real-time preview
- 💾 **Auto Backup** - Automatic versioning when modifying files
- 🚀 **One-Click Publishing** - Direct publishing to WeChat Reading platform

### 🛠️ Tech Stack

#### Backend
- Python 3.8+
- FastAPI
- Anthropic Claude API
- Pydantic for data validation
- Uvicorn ASGI server

#### Frontend  
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS v4
- shadcn/ui components
- Zustand state management
- Axios HTTP client

### 🚀 Quick Start

#### Prerequisites
- Python 3.8+
- Node.js 16+
- Anthropic API Key

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/novel-publication.git
cd novel-publication
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Start backend server
python main.py
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 📁 Project Structure

```
novel-publication/
├── backend/
│   ├── main.py              # FastAPI application entry
│   ├── models/               # Pydantic data models
│   ├── services/            # Business logic
│   │   ├── parser.py        # Markdown parsing
│   │   ├── claude_service.py # AI integration
│   │   └── file_manager.py  # File operations
│   ├── routers/             # API routes
│   └── data/                # Data storage
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   └── types/           # TypeScript types
│   └── package.json
└── docs/                    # Documentation
```

### 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/novel/parse` | POST | Parse Markdown file and generate metadata |
| `/api/novel/update` | PUT | Update novel data |
| `/api/novel/publish` | POST | Publish to platform |
| `/api/novel/list` | GET | List all novels |
| `/api/novel/upload` | POST | Upload novel file |

### 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

### 📊 Performance

- Bundle size: < 200KB gzipped
- Lighthouse score: > 90
- Test coverage: > 70%
- WCAG 2.1 compliant

---

## 中文

### 🎯 项目简介

一个将Markdown格式小说转换为结构化数据的综合性Web应用，支持AI自动生成元数据，一键发布到微信读书等平台。

### ✨ 核心功能

- 📖 **智能解析** - 自动解析Markdown文件，提取标题、章节、字数统计
- 🤖 **AI生成** - 使用Claude API自动生成：
  - 作品简介（200-300字）
  - 作者笔名（2-4字中文）
  - 智能分类（三级分类体系）
  - 精彩片段（400-1000字）
- ✏️ **在线编辑** - 现代化React界面，实时预览
- 💾 **自动备份** - 修改文件时自动备份原始版本
- 🚀 **一键发布** - 直接发布到微信读书平台

### 🛠️ 技术栈

#### 后端
- Python 3.8+
- FastAPI框架
- Anthropic Claude API
- Pydantic数据验证
- Uvicorn ASGI服务器

#### 前端
- React 18 + TypeScript
- Vite构建工具
- Tailwind CSS v4
- shadcn/ui组件库
- Zustand状态管理
- Axios HTTP客户端

### 🚀 快速开始

#### 环境要求
- Python 3.8+
- Node.js 16+
- Anthropic API密钥

#### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/novel-publication.git
cd novel-publication
```

2. **后端配置**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 配置API密钥
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# 启动后端服务
python main.py
```

3. **前端配置**
```bash
cd frontend
npm install
npm run dev
```

4. **访问应用**
- 前端界面：http://localhost:3000
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

### 📁 项目结构

```
novel-publication/
├── backend/
│   ├── main.py              # FastAPI应用入口
│   ├── models/              # 数据模型
│   ├── services/            # 业务逻辑
│   │   ├── parser.py        # Markdown解析
│   │   ├── claude_service.py # AI集成
│   │   └── file_manager.py  # 文件操作
│   ├── routers/             # API路由
│   └── data/                # 数据存储
├── frontend/
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── services/        # API服务
│   │   ├── store/           # 状态管理
│   │   └── types/           # 类型定义
│   └── package.json
└── docs/                    # 项目文档
```

### 🔧 API接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/novel/parse` | POST | 解析Markdown并生成元数据 |
| `/api/novel/update` | PUT | 更新小说数据 |
| `/api/novel/publish` | POST | 发布到平台 |
| `/api/novel/list` | GET | 列出所有小说 |
| `/api/novel/upload` | POST | 上传小说文件 |

### 🧪 测试

```bash
# 后端测试
cd backend
pytest tests/

# 前端测试
cd frontend
npm test
npm run test:coverage
```

### 📊 性能指标

- 打包体积：< 200KB gzipped
- Lighthouse评分：> 90
- 测试覆盖率：> 70%
- WCAG 2.1无障碍标准

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic Claude API](https://www.anthropic.com/) for AI capabilities
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📧 Contact

- Author: Jason Yin
- Email: your.email@example.com
- Project Link: https://github.com/yourusername/novel-publication

---

<div align="center">
Made with ❤️ for Novel Writers

⭐ Star us on GitHub!
</div>