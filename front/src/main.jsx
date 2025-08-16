import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { VisionUIControllerProvider } from '@/dashboard/context' // Using alias
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <VisionUIControllerProvider>
        <App />
      </VisionUIControllerProvider>
    </BrowserRouter>
  </React.StrictMode>
)