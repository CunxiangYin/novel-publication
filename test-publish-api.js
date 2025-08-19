const crypto = require('crypto');
const https = require('https');

// 生成签名
function generateSignature() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const signature = crypto.createHash('md5')
    .update(date + 'aiGenerateBook')
    .digest('hex');
  return signature;
}

// 测试数据
const testData = {
  title: "测试小说-" + Date.now(),
  intro: "这是一个测试小说的简介，用于验证发布接口是否正常工作。",
  author: "测试作者",
  firstCategory: "男频",
  secondCategory: "都市",
  thirdCategory: "都市生活",
  completeStatus: 2,
  awesomeParagraph: "这是一段精彩的内容片段，展示小说的精华部分。主人公在关键时刻做出了重要的决定...",
  chapterList: [
    {
      chapterTitle: "第一章 开端",
      chapterContent: "这是第一章的内容。故事从这里开始，主人公踏上了冒险之旅..."
    },
    {
      chapterTitle: "第二章 发展",
      chapterContent: "第二章展开了更多的情节，主人公遇到了各种挑战和机遇..."
    }
  ]
};

// 发送请求
function testPublishAPI() {
  const signature = generateSignature();
  const postData = JSON.stringify(testData);
  
  console.log('生成的签名:', signature);
  console.log('发送的数据:', JSON.stringify(testData, null, 2));
  console.log('目标地址: https://wxrd.alongmen.com/book/v1/uploadBookInfo');
  console.log('---');

  const options = {
    hostname: 'wxrd.alongmen.com',
    port: 443,
    path: '/book/v1/uploadBookInfo',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'X-Signature': signature
    },
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log('响应状态码:', res.statusCode);
    console.log('响应头:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('响应内容:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('请求错误:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('连接被拒绝，服务可能未启动或地址不正确');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('连接超时，请检查网络或服务器状态');
    }
  });

  req.on('timeout', () => {
    console.error('请求超时');
    req.destroy();
  });

  req.write(postData);
  req.end();
}

// 执行测试
console.log('开始测试微信读书发布接口...');
console.log('当前时间:', new Date().toISOString());
testPublishAPI();