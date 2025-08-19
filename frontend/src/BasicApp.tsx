import { useState } from 'react'

function BasicApp() {
  const [count, setCount] = useState(0)
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>小说发布系统</h1>
      <p>基础版本测试</p>
      <button onClick={() => setCount(count + 1)}>
        点击计数: {count}
      </button>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>功能列表</h2>
        <ul>
          <li>文件上传</li>
          <li>内容编辑</li>
          <li>章节管理</li>
          <li>一键发布</li>
        </ul>
      </div>
    </div>
  )
}

export default BasicApp