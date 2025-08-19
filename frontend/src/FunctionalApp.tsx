import { useState, useCallback } from 'react'
import { novelAPI } from './services/api'

function FunctionalApp() {
  const [activeTab, setActiveTab] = useState('upload')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [novelData, setNovelData] = useState<any>(null)
  const [currentFilePath, setCurrentFilePath] = useState('')
  
  // 处理文件上传
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setLoading(true)
    setMessage('正在上传文件...')
    
    try {
      // 上传文件
      const uploadResult = await novelAPI.uploadFile(file)
      setCurrentFilePath(uploadResult.filePath)
      setMessage('文件上传成功，正在解析...')
      
      // 解析文件
      const parseResult = await novelAPI.parseNovel(uploadResult.filePath)
      setNovelData(parseResult)
      setMessage('解析成功！')
      setActiveTab('edit')
    } catch (error) {
      console.error('处理失败:', error)
      setMessage('处理失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }, [])
  
  // 保存修改
  const handleSave = useCallback(async () => {
    if (!novelData || !currentFilePath) {
      setMessage('请先上传文件')
      return
    }
    
    setLoading(true)
    setMessage('正在保存...')
    
    try {
      await novelAPI.updateNovel(currentFilePath, novelData)
      setMessage('保存成功！')
    } catch (error) {
      console.error('保存失败:', error)
      setMessage('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }, [novelData, currentFilePath])
  
  // 发布作品
  const handlePublish = useCallback(async () => {
    if (!novelData) {
      setMessage('请先上传文件')
      return
    }
    
    if (!window.confirm('确定要发布到微信读书吗？')) {
      return
    }
    
    setLoading(true)
    setMessage('正在发布...')
    
    try {
      const result = await novelAPI.publishNovel(novelData)
      setMessage('发布成功！')
      console.log('发布结果:', result)
    } catch (error) {
      console.error('发布失败:', error)
      setMessage('发布失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }, [novelData])
  
  // 更新表单数据
  const updateField = (field: string, value: any) => {
    setNovelData((prev: any) => ({
      ...prev,
      [field]: value
    }))
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
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
              📚 小说发布系统
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              智能解析 • AI生成 • 一键发布
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {message && (
              <span style={{ 
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: message.includes('失败') ? '#fee' : '#efe',
                color: message.includes('失败') ? '#c00' : '#060'
              }}>
                {message}
              </span>
            )}
            {novelData && (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  💾 保存
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  🚀 发布
                </button>
              </>
            )}
          </div>
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
              fontSize: '16px',
              transition: 'all 0.3s'
            }}
          >
            📤 上传文件
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            disabled={!novelData}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'edit' ? '#6366f1' : 'transparent',
              color: activeTab === 'edit' ? '#fff' : '#666',
              cursor: novelData ? 'pointer' : 'not-allowed',
              borderRadius: '4px 4px 0 0',
              fontSize: '16px',
              opacity: novelData ? 1 : 0.5,
              transition: 'all 0.3s'
            }}
          >
            ✏️ 编辑信息
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            disabled={!novelData}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'chapters' ? '#6366f1' : 'transparent',
              color: activeTab === 'chapters' ? '#fff' : '#666',
              cursor: novelData ? 'pointer' : 'not-allowed',
              borderRadius: '4px 4px 0 0',
              fontSize: '16px',
              opacity: novelData ? 1 : 0.5,
              transition: 'all 0.3s'
            }}
          >
            📖 章节管理
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            disabled={!novelData}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'settings' ? '#6366f1' : 'transparent',
              color: activeTab === 'settings' ? '#fff' : '#666',
              cursor: novelData ? 'pointer' : 'not-allowed',
              borderRadius: '4px 4px 0 0',
              fontSize: '16px',
              opacity: novelData ? 1 : 0.5,
              transition: 'all 0.3s'
            }}
          >
            ⚙️ 发布设置
          </button>
        </div>
        
        {/* Tab Content */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'upload' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#333' }}>上传小说文件</h2>
              <p style={{ color: '#666' }}>支持 Markdown (.md) 格式的小说文件，系统将自动解析并生成元数据</p>
              
              <div style={{
                border: '2px dashed #6366f1',
                borderRadius: '8px',
                padding: '60px 40px',
                textAlign: 'center',
                marginTop: '20px',
                backgroundColor: '#f8f9ff',
                transition: 'all 0.3s'
              }}>
                <p style={{ fontSize: '20px', marginBottom: '20px', color: '#6366f1' }}>
                  📁 拖放文件或点击选择
                </p>
                <input
                  type="file"
                  accept=".md"
                  onChange={handleFileUpload}
                  disabled={loading}
                  style={{ display: 'none' }}
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: loading ? '#ccc' : '#6366f1',
                    color: '#fff',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-block',
                    fontSize: '16px',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? '处理中...' : '选择文件'}
                </label>
                {currentFilePath && (
                  <p style={{ marginTop: '20px', color: '#666' }}>
                    当前文件: {currentFilePath}
                  </p>
                )}
              </div>
              
              {novelData && (
                <div style={{
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px'
                }}>
                  <h3 style={{ marginTop: 0 }}>📊 文件统计</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6366f1' }}>
                        {novelData.metadata?.chapterCount || 0}
                      </p>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>章节数</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6366f1' }}>
                        {(novelData.metadata?.wordCount || 0).toLocaleString()}
                      </p>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>总字数</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                        完结
                      </p>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>状态</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'edit' && novelData && (
            <div>
              <h2 style={{ marginTop: 0, color: '#333' }}>编辑小说信息</h2>
              <form>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      作品标题
                    </label>
                    <input
                      type="text"
                      value={novelData.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      作者笔名
                    </label>
                    <input
                      type="text"
                      value={novelData.author || ''}
                      onChange={(e) => updateField('author', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      一级分类
                    </label>
                    <select
                      value={novelData.firstCategory || ''}
                      onChange={(e) => updateField('firstCategory', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="女频">女频</option>
                      <option value="男频">男频</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      二级分类
                    </label>
                    <select
                      value={novelData.secondCategory || ''}
                      onChange={(e) => updateField('secondCategory', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="现代言情">现代言情</option>
                      <option value="古代言情">古代言情</option>
                      <option value="浪漫青春">浪漫青春</option>
                      <option value="都市">都市</option>
                      <option value="玄幻">玄幻</option>
                      <option value="仙侠">仙侠</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      三级分类
                    </label>
                    <select
                      value={novelData.thirdCategory || ''}
                      onChange={(e) => updateField('thirdCategory', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="豪门总裁">豪门总裁</option>
                      <option value="都市生活">都市生活</option>
                      <option value="婚恋情缘">婚恋情缘</option>
                      <option value="宫廷侯爵">宫廷侯爵</option>
                      <option value="古典架空">古典架空</option>
                      <option value="穿越奇情">穿越奇情</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    作品简介 ({novelData.intro?.length || 0}/300字)
                  </label>
                  <textarea
                    value={novelData.intro || ''}
                    onChange={(e) => updateField('intro', e.target.value)}
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    精彩片段 ({novelData.awesomeParagraph?.length || 0}/1000字)
                  </label>
                  <textarea
                    value={novelData.awesomeParagraph || ''}
                    onChange={(e) => updateField('awesomeParagraph', e.target.value)}
                    rows={8}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    封面图生成Prompt (AI绘图工具使用)
                  </label>
                  <textarea
                    value={novelData.coverPrompt || ''}
                    onChange={(e) => updateField('coverPrompt', e.target.value)}
                    rows={4}
                    placeholder="系统将自动生成适合Midjourney或DALL-E的封面图prompt..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      backgroundColor: novelData.coverPrompt ? '#fff' : '#f9f9f9'
                    }}
                  />
                  {novelData.coverPrompt && (
                    <p style={{ 
                      marginTop: '10px', 
                      padding: '10px',
                      backgroundColor: '#e8f4f8',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      💡 提示：可直接复制此prompt到Midjourney、DALL-E等AI绘图工具生成封面图
                    </p>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: loading ? '#ccc' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {loading ? '保存中...' : '💾 保存修改'}
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'chapters' && novelData && (
            <div>
              <h2 style={{ marginTop: 0, color: '#333' }}>章节管理</h2>
              <p style={{ color: '#666' }}>共 {novelData.chapterList?.length || 0} 章</p>
              
              <div style={{
                maxHeight: '500px',
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                marginTop: '20px'
              }}>
                {novelData.chapterList?.map((chapter: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: '15px',
                      borderBottom: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <span style={{ 
                        display: 'inline-block',
                        width: '40px',
                        height: '40px',
                        lineHeight: '40px',
                        textAlign: 'center',
                        backgroundColor: '#6366f1',
                        color: '#fff',
                        borderRadius: '50%',
                        marginRight: '15px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>
                        {chapter.chapterTitle}
                      </span>
                    </div>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {chapter.content?.length || 0} 字
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && novelData && (
            <div>
              <h2 style={{ marginTop: 0, color: '#333' }}>发布设置</h2>
              
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9ff',
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <h3 style={{ marginTop: 0, color: '#6366f1' }}>📍 目标平台</h3>
                <p style={{ fontSize: '18px', margin: '10px 0' }}>微信读书</p>
                
                <h3 style={{ color: '#6366f1' }}>🔗 发布地址</h3>
                <p style={{ 
                  padding: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  https://wxrd.alongmen.com/book/v1/uploadBookInfo
                </p>
                
                <h3 style={{ color: '#6366f1' }}>📊 发布状态</h3>
                <p style={{ fontSize: '16px' }}>
                  <span style={{
                    padding: '5px 10px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    完结
                  </span>
                </p>
                
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  style={{
                    marginTop: '30px',
                    padding: '14px 28px',
                    backgroundColor: loading ? '#ccc' : '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    width: '100%'
                  }}
                >
                  {loading ? '发布中...' : '🚀 立即发布'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FunctionalApp