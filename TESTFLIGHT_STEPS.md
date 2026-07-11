Spicey TestFlight Upload

This project is prepared as a Capacitor iOS app.

Open this file in Xcode:

ios/App/App.xcworkspace

Steps:

1. Open `ios/App/App.xcworkspace` in Xcode.
2. Click the App project, then the App target.
3. Go to Signing & Capabilities.
4. Select your Apple Developer Team.
5. Confirm Bundle Identifier is `com.spicey.app`.
6. Add/confirm these capabilities:
   - Push Notifications
   - Background Modes
   - Voice over IP
   - Remote notifications
   - Audio, AirPlay, and Picture in Picture
7. Choose Any iOS Device / Generic iOS Device.
8. Click Product > Archive.
9. When Organizer opens, choose Distribute App.
10. Choose App Store Connect, then Upload.
11. After upload finishes, open App Store Connect and add the build to TestFlight.

Notes:

- Transporter accepts a signed `.ipa` or App Store Connect package from Xcode.
- Codex cannot sign the final `.ipa` without your Apple Developer account/team selected in Xcode.
- The web app was built and copied into `ios/App/App/public`.
- iOS permissions and background modes are included in `ios/App/App/Info.plist`.
