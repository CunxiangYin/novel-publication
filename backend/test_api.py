"""
API测试脚本
"""
import asyncio
import httpx
import json
from pathlib import Path

# API基础URL
BASE_URL = "http://localhost:8000"

async def test_parse_novel():
    """测试解析小说文件"""
    print("\n=== 测试解析小说文件 ===")
    
    # 使用实际存在的文件路径
    file_path = "../docs/闺蜜原文-20250814_162657/female_romance_final.md"
    
    # 检查文件是否存在
    if not Path(file_path).exists():
        print(f"文件不存在: {file_path}")
        return None
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/novel/parse",
            json={
                "filePath": file_path,
                "options": {
                    "generateIntro": True,
                    "generateAwesomeParagraph": True,
                    "autoCategories": True
                }
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 解析成功!")
            print(f"  标题: {data['title']}")
            print(f"  作者: {data['author']}")
            print(f"  分类: {data['firstCategory']} > {data['secondCategory']} > {data['thirdCategory']}")
            print(f"  章节数: {len(data['chapterList'])}")
            print(f"  简介: {data['intro'][:100]}...")
            print(f"  精彩片段: {data['awesomeParagraph'][:100]}...")
            return data
        else:
            print(f"✗ 解析失败: {response.status_code}")
            print(f"  错误: {response.text}")
            return None

async def test_publish(data):
    """测试发布功能"""
    print("\n=== 测试发布功能 ===")
    
    if not data:
        print("没有数据可发布")
        return
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/novel/publish",
            json={
                "data": data,
                "platform": "wechat"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ 发布成功!")
            print(f"  响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
        else:
            print(f"✗ 发布失败: {response.status_code}")
            print(f"  错误: {response.text}")

async def test_health():
    """测试健康检查"""
    print("\n=== 测试健康检查 ===")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/novel/health")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 服务健康!")
            print(f"  状态: {data['status']}")
            print(f"  版本: {data['version']}")
        else:
            print(f"✗ 健康检查失败: {response.status_code}")

async def test_list_novels():
    """测试列出小说文件"""
    print("\n=== 测试列出小说文件 ===")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/novel/list")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 获取文件列表成功!")
            print(f"  文件总数: {data['total']}")
            for novel in data['novels']:
                print(f"  - {novel['name']} ({novel['size']} bytes)")
        else:
            print(f"✗ 获取列表失败: {response.status_code}")

async def main():
    """主测试函数"""
    print("=" * 50)
    print("小说发布系统API测试")
    print("=" * 50)
    
    # 测试健康检查
    await test_health()
    
    # 测试列出文件
    await test_list_novels()
    
    # 测试解析小说
    parsed_data = await test_parse_novel()
    
    # 测试发布
    if parsed_data:
        # 询问是否要测试发布
        response = input("\n是否测试发布到微信读书平台? (y/n): ")
        if response.lower() == 'y':
            await test_publish(parsed_data)
    
    print("\n" + "=" * 50)
    print("测试完成!")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())