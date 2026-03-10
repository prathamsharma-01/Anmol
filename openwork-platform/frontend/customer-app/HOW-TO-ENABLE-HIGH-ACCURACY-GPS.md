# How to Enable High-Accuracy GPS Location

## 🎯 For Best Results (10-20m accuracy):

### Windows 10/11 Settings:
1. Press `Win + I` to open Settings
2. Go to **Privacy & Security** → **Location**
3. Turn ON **Location services**
4. Set **Location accuracy** to **High**
5. Scroll down and ensure your browser has location permission

### Browser Settings:

#### Google Chrome / Edge:
1. Click the **lock icon** 🔒 in address bar (left of URL)
2. Click **Site settings**
3. Find **Location** → Set to **Allow**
4. Close and refresh the page
5. Try location detection again

#### Firefox:
1. Click the **lock icon** 🔒 in address bar
2. Click **Connection secure** → **More information**
3. Go to **Permissions** tab
4. Find **Access Your Location** → Check **Allow**
5. Close and refresh

#### In Chrome Settings (for global high-accuracy):
1. Open `chrome://settings/content/location`
2. Ensure "Sites can ask to use your location" is ON
3. Add your site to "Allowed to see your location"

### Windows Location Services (CRITICAL):
1. Press `Win + I`
2. **Privacy & Security** → **Location**
3. Enable **Location service**
4. Enable **Let apps access your location**
5. Enable **Let desktop apps access your location**

### WiFi Scanning (Improves accuracy significantly):
Even if not connected to WiFi, keep WiFi ON:
1. Open Network settings
2. Turn ON WiFi
3. This allows WiFi triangulation for better GPS

### Device Position:
✅ **DO:**
- Stand near a window
- Go to an open area
- Keep device still during detection
- Wait 10-15 seconds patiently

❌ **DON'T:**
- Stay in basement/underground
- Move around during detection
- Block GPS antenna (usually on back of device)
- Expect instant results (good accuracy takes time)

## 🔧 Troubleshooting Poor Accuracy (>100m):

### If you see "±125km" or similar:
This means GPS is not working, using IP fallback.

**Fix:**
1. Check if Location Services are ON in Windows
2. Check if browser has location permission
3. Refresh page and try again
4. Move near window
5. Turn ON WiFi (even if not connected)

### If you see "±50-200m":
GPS is working but accuracy is poor.

**Fix:**
1. Wait longer (up to 30 seconds)
2. Move to window/open area
3. Keep device completely still
4. Enable high-accuracy mode in Windows location settings

### If you see "±10-50m":
✅ This is GOOD! This is accurate enough for delivery.

### If you see "±5-20m":
🎯 EXCELLENT! This is perfect accuracy!

## 📊 What Accuracy Means:

- **±5-20m**: 🟢 Excellent - exact building/house
- **±20-50m**: 🟡 Good - correct street, nearby building
- **±50-100m**: 🟠 Fair - correct area
- **±100m+**: 🔴 Poor - search manually instead

## 💡 Pro Tips:

1. **First time takes longer** - Browser needs to initialize GPS
2. **Subsequent times are faster** - GPS stays warm
3. **WiFi helps even if not connected** - Enables WiFi triangulation
4. **Clear line of sight to sky** - GPS satellites need visibility
5. **Urban areas are harder** - Buildings block GPS signals
6. **Don't rush** - Good accuracy takes 10-15 seconds

## 🚀 Expected Results:

**After following all steps:**
- Urban area near window: 10-30m accuracy
- Open area/outdoors: 5-15m accuracy
- Suburban area: 15-40m accuracy

If you still get poor results, use **manual search** instead and type your exact address!
