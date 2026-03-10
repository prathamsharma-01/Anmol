import React from 'react'
import { Header, Banner, Footer } from '../../../shared-ui/src/index.jsx'

export default function App(){
  return (
    <div>
      <Header />
      <div style={{maxWidth:1100, margin:'0 auto', padding:16}}>
        <Banner />
        <h3>Seller Dashboard</h3>
        <div style={{height:300, background:'#fff', borderRadius:12, marginTop:8}}></div>
      </div>
      <Footer />
    </div>
  )
}
