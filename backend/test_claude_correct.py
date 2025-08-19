"""
正确的Claude API测试
"""
import os
from anthropic import Anthropic
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def test_claude():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    print(f"🔑 API Key: {api_key[:30]}...")
    
    try:
        # 使用messages API (新版本)
        client = Anthropic(api_key=api_key)
        
        print("\n📤 发送测试请求...")
        
        # 使用messages.create方法
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",  # 使用Claude 3.5 Sonnet模型
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": "请用中文回复：你好，我是Claude API测试。请确认连接正常。"
                }
            ]
        )
        
        print(f"\n✅ API连接成功!")
        print(f"📥 响应: {message.content[0].text}")
        
        # 测试生成小说元数据
        print("\n\n📚 测试生成小说元数据...")
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": """
                    请为以下小说生成元数据，返回JSON格式：
                    
                    标题：霸总的意外新娘
                    内容：这是一个关于意外怀孕后与霸道总裁的爱情故事
                    
                    需要生成：
                    {
                        "author": "作者笔名（2-4字）",
                        "intro": "作品简介（100字左右）",
                        "firstCategory": "女频/男频",
                        "secondCategory": "二级分类",
                        "thirdCategory": "三级分类"
                    }
                    """
                }
            ]
        )
        
        print(f"✅ 元数据生成成功:")
        print(message.content[0].text)
        
        return True
        
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        
        # 如果是认证错误
        if "authentication" in str(e).lower() or "401" in str(e):
            print("\n⚠️ API密钥可能无效，请检查.env文件中的ANTHROPIC_API_KEY")
        # 如果是模型错误
        elif "model" in str(e).lower() or "404" in str(e):
            print("\n⚠️ 模型名称可能不正确，尝试使用其他模型:")
            print("  - claude-3-opus-20240229")
            print("  - claude-3-sonnet-20240229")
            print("  - claude-3-haiku-20240307")
            print("  - claude-2.1")
            print("  - claude-2.0")
        
        return False

if __name__ == "__main__":
    print("="*50)
    print("Claude API 测试")
    print("="*50)
    
    if test_claude():
        print("\n🎉 所有测试通过！Claude API工作正常！")
    else:
        print("\n⚠️ 测试失败，请检查配置")
    
    print("="*50)