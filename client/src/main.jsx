import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

// Boot splash: `index.html` me ek loading screen pehle se hota hai, taaki JS
// load hone tak user na khaali safed screen dekhe (Render ke free plan par cold
// start 30-60 second leta hai).
//
// Do raaste hain:
//   1. React mount ho gaya -> splash hata do, app dikhega.
//   2. 20 second baad bhi nahi hua (bundle 404, JS error, network block) ->
//      splash ko saaf error message me badal do. Blank page chhodne se user
//      ko kuch nahi pata chalta ki kya hua, sirf yahi dikhta hai ki site
//      "kharab" hai.
const splash = () => document.getElementById('dj-boot')
const bootMessage = () => document.getElementById('dj-boot-msg')

const clearSplash = () => {
  const node = splash()
  if (node) node.remove()
}

const showBootError = () => {
  const node = splash()
  const msg = bootMessage()
  if (!node || !msg) return clearSplash()

  const ring = node.querySelector('.ring')
  if (ring) ring.remove()

  msg.textContent = 'Site load nahi ho payi. Ye network ya server ki problem ho sakti hai.'
  msg.style.maxWidth = '22rem'
  msg.style.textAlign = 'center'
  msg.style.opacity = '1'
  msg.style.lineHeight = '1.5'

  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Dobara try karein'
  button.style.cssText =
    'margin-top:0.5rem;padding:0.65rem 1.25rem;border-radius:0.9rem;border:0;' +
    'background:#3b82f6;color:#fff;font:inherit;font-size:0.85rem;font-weight:600;cursor:pointer'
  button.addEventListener('click', () => window.location.reload())
  node.appendChild(button)
}

const bootTimer = setTimeout(showBootError, 20000)

root.render(
  <React.StrictMode>
    {/* Sabse upar — ThemeProvider/AuthContext/Router ka crash bhi yahin
        pakda jayega. App ke andar wala boundary sirf pages ke liye hai. */}
    <ErrorBoundary>
      <App onReady={() => { clearTimeout(bootTimer); clearSplash() }} />
    </ErrorBoundary>
  </React.StrictMode>,
)
