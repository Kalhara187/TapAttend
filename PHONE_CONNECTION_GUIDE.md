# Phone Connection Troubleshooting Guide

## Status Check
- ✅ Backend API: `http://10.89.26.160:5000/api/health` - **WORKING** (confirmed from phone)
- ❌ Expo Dev Server: `exp://10.89.26.160:19000` - **NOT CONNECTING** (port 19000 appears blocked)

## Why Port 19000 Might Not Work
Your phone can reach port 5000 (backend) but not port 19000 (Expo). This usually means:
1. **Firewall is selectively blocking port 19000** (while allowing 5000)
2. **ISP/Network is blocking high numbered ports** (19000-19002)
3. **VPN or proxy on your network** is interfering with Expo

## Solutions to Try (in order)

### Solution 1: Try Alternative Expo Ports
Port 19000 may be blocked, but Expo can use different ports. Restart with:
```powershell
cd D:\project\TapAttend\smartattend-scanner
npx expo start --lan
```
When prompted, accept alternate ports like 19001, 19002, or 19003.

From phone, try:
- `exp://10.89.26.160:19001`
- `exp://10.89.26.160:19002`
- `exp://10.89.26.160:19003`

### Solution 2: Use Tunnel Mode (Bypasses Local Port)
Tunnel mode routes through Expo servers instead of direct LAN:
```powershell
cd D:\project\TapAttend\smartattend-scanner
npm run start:tunnel
```
This generates a URL like `exp://...@u.expo.dev/...` that works over internet.

### Solution 3: Try Web Version
Test if the framework loads at all:
```powershell
cd D:\project\TapAttend\smartattend-scanner
npm run web
```
Then open `http://localhost:3000` on your laptop browser.

### Solution 4: Check Windows Firewall Directly
On your laptop, open Windows Defender Firewall → Advanced Settings → Inbound Rules.
Look for rules blocking ports 19000-19002. If found, create an allow rule for Node.js.

### Solution 5: Use USB Android Device (if available)
If you have an Android phone with USB debugging:
```powershell
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
```
Then open Expo Go and scan the QR code.

## Quick Test on Phone

**In Expo Go app:**
1. Tap the menu (≡) icon
2. Tap "Sign in" if not signed in
3. Look for "Scan QR Code" or "Enter URL" button
4. Paste: `exp://10.89.26.160:19000`
5. If it times out, try 19001, 19002, etc.

**If all ports timeout:**
- Tunnel mode is your best option (Solution 2 above)
- Or check that phone is on same Wi-Fi as laptop

## What Information to Provide If Still Stuck

1. **Exact error message** shown on phone (timeout? "host unreachable"? connection refused?)
2. **What happens** when you type the IP directly in Expo Go
3. **Which port** (19000/19001/19002) appears in the terminal after Expo starts
4. **Can you ping** 10.89.26.160 from your phone (via app or network diagnostics)?

## Current Status
- Expo server: **Restarting now**
- Latest QR code terminal: Will show `exp://10.89.26.160:PORT`
- Backend: **Ready and reachable** at http://10.89.26.160:5000/api
