import { useState } from 'react'

function PlainApp() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('App is working!')

  console.log('PlainApp rendered')

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Plain App - No Dependencies</h1>
      <p>If you can see this, React is working correctly.</p>
      
      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc' }}>
        <p>Message: {message}</p>
        <button 
          onClick={() => setMessage('Button clicked at ' + new Date().toLocaleTimeString())}
          style={{ padding: '5px 10px', marginRight: '10px' }}
        >
          Update Message
        </button>
      </div>

      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc' }}>
        <p>Count: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '5px 10px', marginRight: '10px' }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{ padding: '5px 10px' }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>React Version: {require('react').version}</li>
          <li>Page Loaded: {new Date().toLocaleString()}</li>
          <li>Window Size: {window.innerWidth} x {window.innerHeight}</li>
        </ul>
      </div>
    </div>
  )
}

export default PlainApp