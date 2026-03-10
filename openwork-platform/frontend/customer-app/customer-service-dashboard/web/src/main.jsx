import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Use relative import to shared-ui in workspace
import '../../../shared-ui/src/shared.css'

createRoot(document.getElementById('root')).render(<App />)
