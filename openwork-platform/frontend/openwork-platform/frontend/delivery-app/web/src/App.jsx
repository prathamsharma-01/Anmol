import React, { useMemo } from 'react'
import { Header, Banner, Footer, LoginCard } from '../../../shared-ui/src/index.jsx'
import Orders from './Orders'
import DeliveryMap from './DeliveryMap'

export default function App(){
  // mock sample orders with coords (lat/lng)
  const orders = useMemo(() => ([
    { id: 101, customer: 'Asha', address: 'MG Road, Bengaluru', lat: 12.9716, lng: 77.5946 },
    { id: 102, customer: 'Ravi', address: 'Bandra, Mumbai', lat: 19.0544, lng: 72.8408 },
    { id: 103, customer: 'Sima', address: 'Connaught Place, Delhi', lat: 28.6329, lng: 77.2195 }
  ]), [])

  return (
    <div>
      <Header />
      <div style={{maxWidth:1100, margin:'0 auto', padding:16}}>
        <Banner />
        <div style={{display:'flex', gap:16, marginTop:18}}>
          <div style={{flex:'0 0 360px'}}>
            <Orders orders={orders} />
          </div>
          <div style={{flex:1}}>
            <DeliveryMap orders={orders} />
          </div>
        </div>
        <div style={{marginTop:18}}>
          <LoginCard />
        </div>
      </div>
      <Footer />
    </div>
  )
}
