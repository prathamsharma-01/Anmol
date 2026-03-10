import React, { useEffect, useRef, useState } from 'react'

function loadGoogleMaps(apiKey){
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve(window.google.maps)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function DeliveryMap({ orders = [] }){
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const markersRef = useRef([])
  const [gmapsLoaded, setGmapsLoaded] = useState(false)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY not set; please add it to .env')
      return
    }
    loadGoogleMaps(apiKey).then(() => setGmapsLoaded(true)).catch(err => {
      console.error('Failed to load Google Maps', err)
    })
  }, [])

  useEffect(() => {
    if (!gmapsLoaded) return
    const gmaps = window.google.maps
    if (!mapRef.current){
      mapRef.current = new gmaps.Map(containerRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      })
    }

    // clear markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const bounds = new gmaps.LatLngBounds()
    orders.forEach(o => {
      if (o.lat && o.lng){
        const pos = { lat: o.lat, lng: o.lng }
        const marker = new gmaps.Marker({ position: pos, map: mapRef.current, title: `Order #${o.id}` })
        const infow = new gmaps.InfoWindow({ content: `<strong>Order #${o.id}</strong><br/>${o.customer}<br/>${o.address}` })
        marker.addListener('click', () => infow.open(mapRef.current, marker))
        markersRef.current.push(marker)
        bounds.extend(pos)
      }
    })

    if (markersRef.current.length === 1) {
      mapRef.current.setCenter(bounds.getCenter())
      mapRef.current.setZoom(14)
    } else if (markersRef.current.length > 1) {
      mapRef.current.fitBounds(bounds, 80)
    }

  }, [gmapsLoaded, orders])

  const locateMe = () => {
    if (!mapRef.current) return
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        mapRef.current.setCenter(latlng)
        mapRef.current.setZoom(15)
      }, err => {
        console.warn('Locate me denied', err)
      })
    }
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
        <button onClick={locateMe} style={{padding:'6px 10px', borderRadius:8, background:'#ff3b30', color:'#fff', border:'none'}}>Locate me</button>
      </div>
      <div ref={containerRef} id="delivery-map" style={{width:'100%', height:600, borderRadius:12, overflow:'hidden'}}>
        {!gmapsLoaded && (
          <div style={{padding:20, color:'#666'}}>Loading map... (set VITE_GOOGLE_MAPS_API_KEY in .env)</div>
        )}
      </div>
    </div>
  )
}

