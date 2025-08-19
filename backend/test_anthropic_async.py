"""
测试AsyncAnthropic的正确使用方式
"""
import asyncio
from anthropic import AsyncAnthropic
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    client = AsyncAnthropic(api_key=api_key)
    
    print("测试AsyncAnthropic API...")
    
    # 测试messages.create方法
    try:
        message = await client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Say hello in Chinese"}
            ]
        )
        print(f"✅ 成功: {message.content[0].text}")
    except Exception as e:
        print(f"❌ 失败: {e}")

if __name__ == "__main__":
    asyncio.run(test())