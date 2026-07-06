import React from 'react'
import ReactDom from 'react-dom/client'
import './styles.css'
import Com from './components/com'

let App = () => {
  return (
    <div className="container">
      <h1>hello23 234</h1>
      <Com />
    </div>
  )
}

ReactDom.createRoot(document.getElementById('root')).render(<App />)