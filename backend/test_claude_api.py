"""
测试Claude API连接
"""
import asyncio
from anthropic import AsyncAnthropic
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

async def test_claude_api():
    """测试Claude API是否正常工作"""
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key or api_key == "your_api_key_here":
        print("❌ 未找到有效的API密钥")
        return False
    
    print(f"✓ 找到API密钥: {api_key[:20]}...")
    
    try:
        # 初始化客户端
        client = AsyncAnthropic(api_key=api_key)
        
        print("\n正在测试Claude API连接...")
        
        # 发送测试请求
        response = await client.completions.create(
            model="claude-3-opus-20240229",
            prompt="\n\nHuman: 请简单回复'API连接正常'这五个字\n\nAssistant:",
            max_tokens_to_sample=100
        )
        
        result = response.content[0].text
        print(f"\n✅ Claude API响应: {result}")
        
        # 测试生成作者笔名
        print("\n测试生成作者笔名...")
        response = await client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=50,
            messages=[{
                "role": "user",
                "content": "为一部现代言情小说生成一个2-4字的中文笔名，直接返回笔名即可"
            }]
        )
        
        author = response.content[0].text.strip()
        print(f"✅ 生成的笔名: {author}")
        
        # 测试分类功能
        print("\n测试智能分类...")
        response = await client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": """
                分析小说《霸总的意外新娘》，返回JSON格式分类：
                {"firstCategory": "女频/男频", "secondCategory": "二级分类", "thirdCategory": "三级分类"}
                """
            }]
        )
        
        categories = response.content[0].text.strip()
        print(f"✅ 分类结果: {categories}")
        
        print("\n" + "="*50)
        print("🎉 Claude API测试全部通过！")
        print("="*50)
        return True
        
    except Exception as e:
        print(f"\n❌ API调用失败: {str(e)}")
        print("\n可能的原因：")
        print("1. API密钥无效或过期")
        print("2. 网络连接问题")
        print("3. API配额用尽")
        print("4. 模型名称错误")
        return False

async def test_full_novel_processing():
    """测试完整的小说处理流程"""
    print("\n" + "="*50)
    print("测试完整的小说处理流程")
    print("="*50)
    
    import httpx
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # 测试解析（使用Claude API）
            print("\n📖 测试解析小说文件（使用Claude API生成元数据）...")
            
            response = await client.post(
                "http://localhost:8000/api/novel/parse",
                json={
                    "filePath": "../docs/闺蜜原文-20250814_162657/female_romance_final.md",
                    "options": {
                        "generateIntro": True,
                        "generateAwesomeParagraph": True,
                        "autoCategories": True
                    }
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print("\n✅ 解析成功！Claude API生成的内容：")
                print(f"\n📝 作者: {data['author']}")
                print(f"📚 分类: {data['firstCategory']} > {data['secondCategory']} > {data['thirdCategory']}")
                print(f"\n📖 简介:\n{data['intro'][:200]}...")
                print(f"\n✨ 精彩片段:\n{data['awesomeParagraph'][:200]}...")
                
                # 测试生成新的精彩片段
                print("\n\n🔄 测试重新生成精彩片段...")
                response = await client.post(
                    "http://localhost:8000/api/novel/generate-paragraph",
                    json={
                        "chapters": data['chapterList'][:3],
                        "minLength": 400,
                        "maxLength": 1000
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ 新生成的精彩片段:\n{result['awesomeParagraph'][:200]}...")
                
            else:
                print(f"❌ 解析失败: {response.status_code}")
                print(response.text)
                
    except Exception as e:
        print(f"❌ 测试失败: {str(e)}")

async def main():
    """主测试函数"""
    print("="*50)
    print("Claude API 测试程序")
    print("="*50)
    
    # 测试基础API连接
    api_works = await test_claude_api()
    
    if api_works:
        # 测试完整流程
        await test_full_novel_processing()
    
    print("\n测试完成！")

if __name__ == "__main__":
    asyncio.run(main())