"""
简单测试Claude API
"""
import os
from anthropic import Anthropic
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def test_claude():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    print(f"API Key: {api_key[:30]}...")
    
    try:
        # 使用同步客户端测试
        client = Anthropic(api_key=api_key)
        
        # 测试简单请求
        response = client.completions.create(
            model="claude-instant-1.2",
            prompt="\n\nHuman: Say 'Hello World'\n\nAssistant:",
            max_tokens_to_sample=100
        )
        
        print(f"Response: {response.completion}")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        print(f"Error type: {type(e)}")
        return False

if __name__ == "__main__":
    test_claude()