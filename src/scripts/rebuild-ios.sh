#!/bin/bash

echo "🔨 Building Spicey app..."
npm run build

echo ""
echo "📱 Syncing to iOS..."
npx cap sync ios

echo ""
echo "✅ Done! iOS bundle updated."
echo ""
echo "Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Product → Clean Build Folder (Shift+Cmd+K)"
echo "3. Rebuild and run on device"