import { useState } from 'react'

function WorkingApp() {
  const [activeTab, setActiveTab] = useState('upload')
  const [fileName, setFileName] = useState('')
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }
  
  return (
    <div style={{ 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            📚 小说发布系统
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            智能解析 • AI生成 • 一键发布
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {/* Tabs */}
        <div style={{ 
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'upload' ? '#6366f1' : 'transparent',
              color: activeTab === 'upload' ? '#fff' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '16px'
            }}
          >
            上传文件
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'edit' ? '#6366f1' : 'transparent',
              color: activeTab === 'edit' ? '#fff' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '16px'
            }}
          >
            编辑信息
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'chapters' ? '#6366f1' : 'transparent',
              color: activeTab === 'chapters' ? '#fff' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '16px'
            }}
          >
            章节管理
          </button>
        </div>
        
        {/* Tab Content */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'upload' && (
            <div>
              <h2 style={{ marginTop: 0 }}>上传小说文件</h2>
              <p style={{ color: '#666' }}>支持 Markdown (.md) 格式的小说文件</p>
              
              <div style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                marginTop: '20px'
              }}>
                <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                  📁 拖放文件或点击选择
                </p>
                <input
                  type="file"
                  accept=".md"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6366f1',
                    color: '#fff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                >
                  选择文件
                </label>
                {fileName && (
                  <p style={{ marginTop: '20px', color: '#666' }}>
                    已选择: {fileName}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'edit' && (
            <div>
              <h2 style={{ marginTop: 0 }}>编辑小说信息</h2>
              <form>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    作品标题
                  </label>
                  <input
                    type="text"
                    placeholder="请输入作品标题"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    作者笔名
                  </label>
                  <input
                    type="text"
                    placeholder="请输入作者笔名"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    作品简介
                  </label>
                  <textarea
                    placeholder="请输入作品简介（200-300字）"
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <button
                  type="button"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  保存修改
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'chapters' && (
            <div>
              <h2 style={{ marginTop: 0 }}>章节管理</h2>
              <p style={{ color: '#666' }}>请先上传文件以查看章节列表</p>
              
              <div style={{
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: '20px',
                marginTop: '20px',
                backgroundColor: '#f9f9f9'
              }}>
                <p style={{ textAlign: 'center', color: '#999' }}>
                  暂无章节数据
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkingApp