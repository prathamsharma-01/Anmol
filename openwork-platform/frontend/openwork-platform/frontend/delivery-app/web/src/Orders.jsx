import React from 'react'

function openGoogleMapsDirections(lat, lng){
  if (!lat || !lng) return
  // try to get current location
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos => {
      const origin = `${pos.coords.latitude},${pos.coords.longitude}`
      const dest = `${lat},${lng}`
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving`
      window.open(url, '_blank')
    }, err => {
      // fallback: open maps with destination only (device will use current location)
      const dest = `${lat},${lng}`
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`
      window.open(url, '_blank')
    })
  } else {
    const dest = `${lat},${lng}`
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`
    window.open(url, '_blank')
  }
}

export default function Orders({ orders = [] }){
  return (
    <div style={{background:'#fff', padding:12, borderRadius:10}}>
      <h3>Pending Orders</h3>
      {orders.length === 0 ? (
        <p>No pending orders</p>
      ) : (
        <ul>
          {orders.map(o => (
            <li key={o.id} style={{marginBottom:12}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <strong>#{o.id}</strong> — {o.customer}
                  <div style={{fontSize:12, color:'#666'}}>{o.address}</div>
                </div>
                <div>
                  <button onClick={() => openGoogleMapsDirections(o.lat, o.lng)} style={{background:'#ff3b30', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6}}>Navigate</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
