import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

function showError(msg) {
  document.getElementById('root').innerHTML = `<div style="padding:24px;font-family:sans-serif;color:#a32626"><h2>App failed to load</h2><pre style="white-space:pre-wrap;font-size:12px;background:#f8f8f8;padding:12px;border-radius:8px;margin-top:8px">${msg}</pre></div>`
}
window.addEventListener('error', e => showError(e.message + '\n' + (e.error?.stack || '')))
window.addEventListener('unhandledrejection', e => showError('Promise error: ' + (e.reason?.message || e.reason)))

try {
  ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
} catch(err) { showError(err.message + '\n' + (err.stack || '')) }
