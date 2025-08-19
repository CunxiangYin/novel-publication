"""
测试文本清理服务
"""
import requests
import json

# API基础URL
BASE_URL = "http://localhost:8000/api/strip"

def test_basic_strip():
    """测试基础清理"""
    text = "  这是一个测试文本   \n\n   有很多空白   "
    response = requests.post(f"{BASE_URL}/clean", json={
        "text": text,
        "strip_type": "basic"
    })
    print("基础清理结果:", response.json())

def test_html_strip():
    """测试HTML清理"""
    text = "<p>这是<b>HTML</b>文本</p><script>alert('test')</script>"
    response = requests.post(f"{BASE_URL}/html", json={
        "text": text
    })
    print("HTML清理结果:", response.json())

def test_markdown_strip():
    """测试Markdown清理"""
    text = "# 标题\n**粗体**文本\n- 列表项\n[链接](http://example.com)"
    response = requests.post(f"{BASE_URL}/markdown", json={
        "text": text
    })
    print("Markdown清理结果:", response.json())

def test_emoji_strip():
    """测试emoji清理"""
    text = "这是带emoji的文本😀🎉👍"
    response = requests.post(f"{BASE_URL}/emoji", json={
        "text": text
    })
    print("Emoji清理结果:", response.json())

def test_smart_strip():
    """测试智能清理"""
    text = """
    <h1>第一章 春药误食</h1>
    
    　　这是一段**小说**内容... 😊
    
    包含了各种格式：https://example.com
    
    邮箱：test@example.com
    
    还有一些标点符号！！！？？？
    """
    
    response = requests.post(f"{BASE_URL}/clean", json={
        "text": text,
        "strip_type": "smart",
        "options": {
            "strip_whitespace": True,
            "strip_html": True,
            "strip_markdown": True,
            "strip_urls": True,
            "strip_emoji": True,
            "normalize": True
        }
    })
    
    result = response.json()
    print("\n智能清理结果:")
    print("原文长度:", len(result['original_text']))
    print("清理后长度:", len(result['cleaned_text']))
    print("清理后文本:", result['cleaned_text'])
    print("统计信息:", result['stats'])

def test_publish_preparation():
    """测试发布准备"""
    text = """
第一章 春药误食

这是第一段内容，没有缩进。

这是第二段内容。

这是第三段内容。
    """
    
    response = requests.post(f"{BASE_URL}/clean", json={
        "text": text,
        "strip_type": "publish"
    })
    
    result = response.json()
    print("\n发布准备结果:")
    print(result['cleaned_text'])

def test_get_stats():
    """测试文本统计"""
    text = """
    这是一段测试文本，包含中文、English、123数字。
    
    还有第二段。
    
    以及第三段内容。
    """
    
    response = requests.post(f"{BASE_URL}/stats", json={
        "text": text
    })
    
    print("\n文本统计结果:", json.dumps(response.json(), ensure_ascii=False, indent=2))

if __name__ == "__main__":
    print("=" * 50)
    print("文本清理服务测试")
    print("=" * 50)
    
    try:
        # 获取支持的类型
        response = requests.get(f"{BASE_URL}/types")
        print("\n支持的清理类型:")
        print(json.dumps(response.json(), ensure_ascii=False, indent=2))
        
        print("\n" + "=" * 50)
        print("开始测试各种清理功能")
        print("=" * 50)
        
        test_basic_strip()
        print("\n" + "-" * 30)
        
        test_html_strip()
        print("\n" + "-" * 30)
        
        test_markdown_strip()
        print("\n" + "-" * 30)
        
        test_emoji_strip()
        print("\n" + "-" * 30)
        
        test_smart_strip()
        print("\n" + "-" * 30)
        
        test_publish_preparation()
        print("\n" + "-" * 30)
        
        test_get_stats()
        
    except Exception as e:
        print(f"测试失败: {e}")
        print("请确保后端服务正在运行")