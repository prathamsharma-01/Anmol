import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

// This component prefers MapTiler raster tiles via Leaflet when VITE_MAPTILER_KEY is
// present. If not present, it falls back to the existing Google Maps implementation
// (which requires VITE_GOOGLE_MAPS_API_KEY).

export default function DeliveryMap({ orders = [], selectedOrderId = null }){
  const containerRef = useRef(null)
  const leafletMapRef = useRef(null)
  const markersRef = useRef([])
  const [usingMapTiler, setUsingMapTiler] = useState(false)
  const [gmapsLoaded, setGmapsLoaded] = useState(false)

  useEffect(() => {
    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY
    if (maptilerKey){
      // Lazy-load Leaflet and initialize a map using MapTiler raster tiles
      import('leaflet').then(L => {
        // Create map if missing
        if (!leafletMapRef.current){
          const map = L.map(containerRef.current, { center: [20.5937, 78.9629], zoom: 5 })
          leafletMapRef.current = map

          // Use MapTiler maps/streets raster tiles (256px) which is compatible and tested.
          const tileUrl = `https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${maptilerKey}`
          const tileLayer = L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> | &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            maxZoom: 20,
          }).addTo(map)
          tileLayer.on('tileerror', () => {
            try { tileLayer.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png') } catch(e){}
          })
        }
        setUsingMapTiler(true)
      }).catch(err => {
        console.error('Failed to load Leaflet for MapTiler', err)
      })
    } else {
      // no MapTiler key — leave Google Maps path (load later in effect below)
    }
  }, [])

  // Google Maps loader (fallback)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!import.meta.env.VITE_MAPTILER_KEY && apiKey){
      if (window.google && window.google.maps){
        setGmapsLoaded(true)
        return
      }
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      script.onload = () => setGmapsLoaded(true)
      script.onerror = (e) => console.error('Failed to load Google Maps', e)
      document.head.appendChild(script)
    }
  }, [])

  // Sync markers for both modes
  useEffect(() => {
    // Clear previous markers
    if (usingMapTiler && leafletMapRef.current){
      ;(async () => {
        const mod = await import('leaflet')
        const L = mod.default || mod
        markersRef.current.forEach(m => {
          try { leafletMapRef.current.removeLayer(m) } catch(_){}}
        )
        markersRef.current = []

        const bounds = L.latLngBounds()
        orders.forEach(o => {
          if (o.lat && o.lng){
            const marker = L.marker([o.lat, o.lng]).addTo(leafletMapRef.current).bindPopup(`<strong>Order #${o.id}</strong><br/>${o.customer || ''}<br/>${o.address || ''}`)
            markersRef.current.push(marker)
            bounds.extend([o.lat, o.lng])
          }
        })
        if (markersRef.current.length === 1) leafletMapRef.current.setView(bounds.getCenter(), 14)
        else if (markersRef.current.length > 1) leafletMapRef.current.fitBounds(bounds.pad(0.1))
        // if a selected order exists, open its popup & center
        if (selectedOrderId){
          const sel = orders.find(x => x.id === selectedOrderId)
          if (sel){
            leafletMapRef.current.setView([sel.lat, sel.lng], 15)
            const m = markersRef.current.find(mm => {
              const p = mm.getLatLng(); return Math.abs(p.lat - sel.lat) < 1e-6 && Math.abs(p.lng - sel.lng) < 1e-6
            })
            if (m) try { m.openPopup() } catch(e){}
          }
        }
      })()
      return
    }

    if (gmapsLoaded){
      const gmaps = window.google.maps
      if (!leafletMapRef.current || !(leafletMapRef.current instanceof gmaps.Map)){
        // Create a lightweight wrapper object to hold google map instance in the same ref
        if (!leafletMapRef.current){
          leafletMapRef.current = new gmaps.Map(containerRef.current, { center: { lat: 20.5937, lng: 78.9629 }, zoom: 5 })
        }
      }

      // Clear markers
      markersRef.current.forEach(m => m.setMap && m.setMap(null))
      markersRef.current = []

      const bounds = new gmaps.LatLngBounds()
      orders.forEach(o => {
        if (o.lat && o.lng){
          const pos = { lat: o.lat, lng: o.lng }
          const marker = new gmaps.Marker({ position: pos, map: leafletMapRef.current, title: `Order #${o.id}` })
          const infow = new gmaps.InfoWindow({ content: `<strong>Order #${o.id}</strong><br/>${o.customer || ''}<br/>${o.address || ''}` })
          marker.addListener('click', () => infow.open(leafletMapRef.current, marker))
          markersRef.current.push(marker)
          bounds.extend(pos)
        }
      })

      if (markersRef.current.length === 1) leafletMapRef.current.setCenter(bounds.getCenter())
      else if (markersRef.current.length > 1) leafletMapRef.current.fitBounds(bounds, 80)
      if (selectedOrderId && gmapsLoaded){
        const sel = orders.find(x => x.id === selectedOrderId)
        if (sel){
          leafletMapRef.current.setCenter({ lat: sel.lat, lng: sel.lng })
          leafletMapRef.current.setZoom(15)
        }
      }
    }
  }, [usingMapTiler, gmapsLoaded, orders])

  const locateMe = () => {
    if (usingMapTiler && leafletMapRef.current){
      if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => {
        leafletMapRef.current.setView([p.coords.latitude, p.coords.longitude], 15)
      }, e => console.warn('geolocation denied', e))
      return
    }

    if (gmapsLoaded && leafletMapRef.current){
      if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => {
        leafletMapRef.current.setCenter({ lat: p.coords.latitude, lng: p.coords.longitude })
        leafletMapRef.current.setZoom(15)
      }, e => console.warn('geolocation denied', e))
    }
  }

  // Live watch of delivery person's location
  useEffect(() => {
    let watchId = null
    let meMarker = null
    if (usingMapTiler && leafletMapRef.current && navigator.geolocation){
      ;(async () => {
        const mod = await import('leaflet')
        const L = mod.default || mod
        watchId = navigator.geolocation.watchPosition(p => {
          const lat = p.coords.latitude, lng = p.coords.longitude
          if (!meMarker){
            meMarker = L.marker([lat, lng], { title: 'You', opacity: 0.9 }).addTo(leafletMapRef.current)
          } else {
            meMarker.setLatLng([lat, lng])
          }
        }, e => console.warn('geo watch err', e), { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 })
      })()
    }

    if (gmapsLoaded && leafletMapRef.current && navigator.geolocation){
      watchId = navigator.geolocation.watchPosition(p => {
        const lat = p.coords.latitude, lng = p.coords.longitude
        if (!meMarker){
          const gmaps = window.google.maps
          meMarker = new gmaps.Marker({ position: { lat, lng }, map: leafletMapRef.current, title: 'You', opacity: 0.9 })
        } else {
          meMarker.setPosition({ lat, lng })
        }
      }, e => console.warn('geo watch err', e), { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 })
    }

    return () => {
      try { if (watchId !== null) navigator.geolocation.clearWatch(watchId) } catch(e){}
      try { if (meMarker && meMarker.remove) meMarker.remove(); else if (meMarker && meMarker.setMap) meMarker.setMap(null) } catch(e){}
    }
  }, [usingMapTiler, gmapsLoaded])

  return (
    <div>
      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
        <button onClick={locateMe} style={{padding:'6px 10px', borderRadius:8, background:'#ff3b30', color:'#fff', border:'none'}}>Locate me</button>
      </div>
      <div ref={containerRef} id="delivery-map" style={{width:'100%', height:600, borderRadius:12, overflow:'hidden'}}>
        {!usingMapTiler && !gmapsLoaded && (
          <div style={{padding:20, color:'#666'}}>Loading map... (set VITE_MAPTILER_KEY or VITE_GOOGLE_MAPS_API_KEY in .env)</div>
        )}
      </div>
    </div>
  )
}

