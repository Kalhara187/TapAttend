# 🎨 Assets Guide

This directory contains app assets like sounds, icons, and images.

## Required Files

### 1. Success Sound (`success.wav`)

**Purpose**: Play notification sound when QR code is successfully scanned

**Specifications**:
- Format: WAV or MP3
- Duration: 0.5 - 1 second
- Volume: Medium (normalized to -3dB)
- Sample Rate: 44.1 kHz or 48 kHz
- Channels: Mono or Stereo

**How to Add**:
1. Create or download a success sound file
2. Place in `smartattend-scanner/src/assets/`
3. Name it `success.wav`

**Sources**:
- Free Sound: https://freesound.org
- Zapsplat: https://www.zapsplat.com
- Notification Sounds: https://notificationsounds.com

**Recommended Sounds**:
- "Ding" sound
- "Bell" notification
- "Success" chime
- "Beep" tone

### 2. App Icon (`icon.png`)

**Purpose**: Display app icon on home screen and app store

**Specifications**:
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Color: Match app theme (cyan/dark theme)
- Corners: Can be rounded by Expo

**How to Add**:
1. Create or design an icon
2. Save as `icon.png` in this directory
3. Expo will auto-generate all sizes

**Design Tips**:
- Simple, recognizable design
- Works at small sizes (48px, 72px, 192px)
- Include app initials or logo
- Use primary colors (cyan #06b6d4)

### 3. Splash Screen (`splash.png`)

**Purpose**: Show while app is loading

**Specifications**:
- Size: 1080x2340 pixels (or 1:2 ratio)
- Format: PNG
- Color: Match background (#071029)
- Safe area: Center 80%

**How to Add**:
1. Design splash screen image
2. Save as `splash.png` in this directory
3. Configured in `app.json`

**Design Tips**:
- Include app logo and name
- Use dark theme colors
- Keep text minimal
- Show loading indicator at bottom

### 4. Favicon (`favicon.png`) - Web

**Purpose**: Favicon for web version (if deployed)

**Specifications**:
- Size: 192x192 pixels minimum
- Format: PNG
- Background: Transparent or dark

**How to Add**:
1. Save favicon as `favicon.png`
2. Configured in `app.json`

## Using Assets in Code

### Sound Files

```javascript
import { Audio } from 'expo-av';

async function playSuccessSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/success.wav')
    );
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}
```

### Image Files

```javascript
import { Image } from 'react-native';

<Image 
  source={require('../assets/icon.png')} 
  style={{ width: 100, height: 100 }} 
/>
```

## Expo Auto-Generate

Expo automatically generates multiple icon sizes from `icon.png`:
- Android icons: 48x48, 72x72, 96x96, 144x144, 192x192, 384x384, 512x512
- iOS icons: Multiple sizes for different devices
- Web icon: 192x192, 512x512

No need to provide multiple sizes manually!

## Asset Optimization

### Image Optimization
```bash
# Use ImageOptim or similar
# Compress PNG files to reduce app size
# Target size: < 100KB per image
```

### Audio Optimization
```bash
# Use Audacity or similar
# Convert to MP3 for web, WAV for native
# Normalize audio to -3dB
# Remove silence from start/end
```

## Size Budget

Keep app size reasonable:
- Assets: < 5 MB
- Sound files: < 500 KB
- Images: < 3 MB
- Total app size: < 50 MB (ideal)

## Troubleshooting

### Sound Not Playing
- Check file format (WAV, MP3, M4A, AIFF)
- Verify file path is correct
- Check file permissions
- Test on actual device (emulator audio may be limited)

### Icon Not Showing
- Verify PNG format with transparency
- Check size is at least 512x512
- Rebuild app after adding icon
- Clear Expo cache: `expo start --clear`

### Image Quality Issues
- Use high-resolution source (2x or 3x)
- Optimize before adding
- Test on different screen sizes

## Tools

### Icon Creators
- Figma: https://figma.com
- Adobe XD: https://adobe.com/products/xd
- Inkscape: https://inkscape.org (free)
- Photoshop: https://adobe.com/products/photoshop

### Sound Editors
- Audacity: https://audacityteam.org (free)
- Adobe Audition: https://adobe.com/products/audition
- GarageBand: macOS built-in
- WavePad: https://nchsoftware.com/wavepad

### Image Optimizers
- TinyPNG: https://tinypng.com
- ImageOptim: https://imageoptim.com (macOS)
- FileZilla: https://filezilla-project.org
- GIMP: https://gimp.org (free)

## Asset Checklist

- [ ] `success.wav` - Success notification sound (< 500 KB)
- [ ] `icon.png` - App icon (1024x1024, < 1 MB)
- [ ] `splash.png` - Splash screen (1080x2340, < 2 MB)
- [ ] `favicon.png` - Web favicon (192x192, < 100 KB)
- [ ] All files optimized for size
- [ ] All files in correct format
- [ ] All files properly named
- [ ] Tested on device

---

**Note**: Assets are loaded at compile time, so rebuild app after adding new assets.

For more info, see [app.json configuration](../app.json).
