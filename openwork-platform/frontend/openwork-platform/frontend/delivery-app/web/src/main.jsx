import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Import shared UI styles from local workspace
import '../../../shared-ui/src/shared.css'

createRoot(document.getElementById('root')).render(<App />)

// Register service worker (very small) to enable install prompt on supported browsers
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').catch(err => {
			// ignore registration errors in dev
			// console.warn('SW registration failed', err)
		})
	})
}
