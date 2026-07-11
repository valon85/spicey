import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: CAPAppDelegate {

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        return super.application(
            application,
            didFinishLaunchingWithOptions: launchOptions
        )
    }

    // MARK: - Push Notification Registration

    override func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        // Bridge to Capacitor — required for @capacitor/push-notifications to fire
        // capacitorDidRegisterForRemoteNotifications
        NotificationCenter.default.post(
            name: NSNotification.Name("capacitorDidRegisterForRemoteNotifications"),
            object: deviceToken
        )
        super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
    }

    override func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        NotificationCenter.default.post(
            name: NSNotification.Name("capacitorDidFailToRegisterForRemoteNotifications"),
            object: error
        )
        super.application(application, didFailToRegisterForRemoteNotificationsWithError: error)
    }

    override func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        NotificationCenter.default.post(
            name: NSNotification.Name("capacitorDidReceiveRemoteNotification"),
            object: userInfo
        )
        super.application(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler)
        completionHandler(.newData)
    }
}