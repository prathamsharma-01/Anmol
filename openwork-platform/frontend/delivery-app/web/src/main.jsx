import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Import shared UI styles from local workspace
import '../../../shared-ui/src/shared.css'

class ErrorBoundary extends React.Component {
	constructor(props){ super(props); this.state = { error: null } }
	static getDerivedStateFromError(error){ return { error } }
	componentDidCatch(error, info){
		try { console.error('Runtime error in app', error, info) } catch(e){}
			try { alert('Application error: ' + String(error)) } catch(e){}
	}
	render(){
		if (this.state.error){
			return (
				<div style={{padding:20,fontFamily:'sans-serif'}}>
					<h2 style={{color:'#c00'}}>Application error</h2>
					<pre style={{whiteSpace:'pre-wrap',background:'#fee',padding:12,borderRadius:6}}>{String(this.state.error)}</pre>
				</div>
			)
		}
		return this.props.children
	}
}

createRoot(document.getElementById('root')).render(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
)

// global fallbacks to help surface errors in dev when the page otherwise goes blank
try {
	window.addEventListener('error', e => {
		try { alert('Runtime error: ' + (e.error ? e.error.message : e.message || e.toString())) } catch(e){}
	})
	window.addEventListener('unhandledrejection', e => {
		try { alert('Unhandled rejection: ' + (e.reason ? (e.reason.message || String(e.reason)) : String(e))) } catch(e){}
	})
} catch(e){}

// Register service worker only in production builds.
// In dev this can cause the dev server navigation to be intercepted and
// return stale/empty responses — avoid registering during development.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').catch(err => {
			// ignore registration errors in dev-like environments
		})
	})
}
