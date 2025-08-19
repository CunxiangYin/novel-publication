#!/bin/bash

# 生成签名
DATE=$(date +%Y%m%d)
SIGNATURE=$(echo -n "${DATE}aiGenerateBook" | md5sum | cut -d' ' -f1)

echo "测试微信读书发布接口"
echo "===================="
echo "目标地址: https://wxrd.alongmen.com/book/v1/uploadBookInfo"
echo "日期: $DATE"
echo "签名: $SIGNATURE"
echo ""

# 测试数据
TIMESTAMP=$(date +%s%3N)
DATA=$(cat <<EOF
{
  "title": "测试小说-${TIMESTAMP}",
  "intro": "这是一个测试小说的简介，用于验证发布接口是否正常工作。",
  "author": "测试作者",
  "firstCategory": "男频",
  "secondCategory": "都市",
  "thirdCategory": "都市生活",
  "completeStatus": 2,
  "awesomeParagraph": "这是一段精彩的内容片段，展示小说的精华部分。",
  "chapterList": [
    {
      "chapterTitle": "第一章 开端",
      "chapterContent": "这是第一章的内容。"
    },
    {
      "chapterTitle": "第二章 发展",
      "chapterContent": "第二章的内容。"
    }
  ]
}
EOF
)

echo "发送测试请求..."
echo "---"

# 发送请求
curl -X POST https://wxrd.alongmen.com/book/v1/uploadBookInfo \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$DATA" \
  -w "\n\nHTTP状态码: %{http_code}\n响应时间: %{time_total}秒\n" \
  -s | jq '.' 2>/dev/null || cat

echo ""
echo "测试完成!"