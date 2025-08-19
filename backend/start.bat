@echo off
echo ======================================
echo    小说发布系统启动脚本 (Windows)
echo ======================================

cd /d "%~dp0"

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装，请先安装Python3
    pause
    exit /b 1
)

echo ✓ Python已安装

REM 创建虚拟环境（如果不存在）
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖
echo 安装依赖包...
pip install -q -r requirements.txt

REM 创建必要的目录
echo 创建必要的目录...
if not exist "data\novels" mkdir data\novels
if not exist "data\backups" mkdir data\backups
if not exist "uploads" mkdir uploads
if not exist "static" mkdir static

REM 检查环境变量
if not exist ".env" (
    echo ⚠️  .env文件不存在，使用默认配置
    echo    请编辑.env文件配置您的Anthropic API密钥
)

echo.
echo ======================================
echo    启动FastAPI服务
echo ======================================
echo.
echo 📌 访问地址:
echo    Web界面: http://localhost:8000
echo    API文档: http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服务
echo.

REM 启动FastAPI
python main.py

pause