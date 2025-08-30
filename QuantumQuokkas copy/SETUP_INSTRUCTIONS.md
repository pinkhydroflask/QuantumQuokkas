# PAC App Setup Instructions - QuantumQuokkas Location

## Project Successfully Moved to: `/Users/laurendanaho/Documents/QuantumQuokkas`

Your Personal AI Privacy Capsule (PAC) app has been completely moved and recreated in the new location. All files, dependencies, and configurations are now properly set up.

## 🚀 Quick Start

### 1. Start the Backend API
```bash
cd /Users/laurendanaho/Documents/QuantumQuokkas
source api/.venv/bin/activate
PYTHONPATH="/Users/laurendanaho/Documents/QuantumQuokkas" python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### 2. Start the React Native App
```bash
cd /Users/laurendanaho/Documents/QuantumQuokkas/app/rn/pac-rn
npx expo start --lan
```

## 📱 Running on Expo Go

1. **Install Expo Go** on your mobile device
2. **Scan the QR code** that appears in the terminal
3. **Update API Base URL** if needed:
   - Open `src/lib/config.ts`
   - Change `192.168.1.100` to your Mac's actual LAN IP address
   - You can find your IP with: `ifconfig | grep "inet " | grep -v 127.0.0.1`

## 🔧 What's Been Set Up

### Backend (FastAPI)
- ✅ Complete API with all endpoints
- ✅ PII detection and sanitization
- ✅ Image processing and blurring
- ✅ Audit logging and CSV export
- ✅ HMAC-signed receipts
- ✅ Redis integration (optional)
- ✅ Comprehensive test suite

### Frontend (React Native)
- ✅ Modern, dark-themed UI
- ✅ All 5 main screens (Home, TextCapsule, ImageCapsule, Audit, Settings)
- ✅ Navigation and state management
- ✅ Image picking and processing
- ✅ CSV export functionality
- ✅ Settings persistence

### Project Structure
```
QuantumQuokkas/
├── api/                 # FastAPI backend
├── app/
│   ├── lynx/           # Placeholder for Lynx
│   └── rn/pac-rn/      # React Native app
├── scripts/             # Helper scripts
├── data/                # Data storage
├── docker-compose.yml   # Redis setup
├── README.md            # Project documentation
└── LICENSE              # MIT license
```

## 🧪 Testing Features

### Text Capsule
1. Enter text with PII (emails, phones, addresses)
2. Click "Sanitize Text" to see placeholders
3. Click "Ask AI" to send sanitized text
4. Click "Reinsert Placeholders" to restore original

### Image Capsule
1. Click "Pick Image from Gallery"
2. Click "Blur Image" for on-device pixelation
3. Optional: "Analyze with AI" for blurred image

### Audit & Receipts
1. View all processing history
2. Export CSV (local or backend)
3. Create and verify deletion receipts

### Settings
1. Configure text/image processing rules
2. Set location privacy radius
3. All settings persist automatically

## 🔍 Troubleshooting

### Common Issues
- **API Connection**: Ensure backend is running on port 8000
- **LAN IP**: Update `src/lib/config.ts` with your Mac's actual IP
- **Permissions**: Grant photo library access when prompted
- **Dependencies**: Run `npm install` if you see missing module errors

### Port Conflicts
```bash
# Kill processes using port 8000
lsof -ti tcp:8000 | xargs -r kill -9

# Kill Expo processes
pkill -f "expo.*start"
pkill -f "node .*metro"
```

## 📊 Current Status

- ✅ **Backend**: Fully functional with all endpoints
- ✅ **Frontend**: Complete React Native app with modern UI
- ✅ **Features**: All core functionality implemented
- ✅ **Testing**: Comprehensive test suite ready
- ✅ **Documentation**: Complete setup and usage guides

## 🎯 Next Steps

1. **Test the app** on your device using Expo Go
2. **Customize settings** in the Settings screen
3. **Process some sample data** to see the privacy features in action
4. **Export audit logs** to verify CSV functionality

Your PAC app is now fully operational in the new location! 🎉
