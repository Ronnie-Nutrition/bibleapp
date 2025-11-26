import SwiftUI

// MARK: - Notification Preferences View
struct NotificationPreferencesView: View {
    @ObservedObject var viewModel: NotificationPreferencesViewModel
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            Form {
                // MARK: - General Settings
                Section("General") {
                    Toggle("Enable Notifications", isOn: $viewModel.notificationsEnabled)
                        .onChange(of: viewModel.notificationsEnabled) { newValue in
                            Task {
                                await viewModel.updatePreference(
                                    key: "notificationsEnabled",
                                    value: newValue
                                )
                            }
                        }

                    if viewModel.notificationsEnabled {
                        Toggle("Email Notifications", isOn: $viewModel.emailNotifications)
                            .onChange(of: viewModel.emailNotifications) { newValue in
                                Task {
                                    await viewModel.updatePreference(
                                        key: "emailNotifications",
                                        value: newValue
                                    )
                                }
                            }
                    }
                }

                // MARK: - Daily Lesson Settings
                if viewModel.notificationsEnabled {
                    Section("Daily Lesson Reminders") {
                        Toggle("Daily Lessons", isOn: $viewModel.dailyLessonsEnabled)
                            .onChange(of: viewModel.dailyLessonsEnabled) { newValue in
                                Task {
                                    await viewModel.updateDailyLessonsPreference(newValue)
                                }
                            }

                        if viewModel.dailyLessonsEnabled {
                            // Time Picker
                            HStack {
                                Text("Preferred Time")
                                Spacer()
                                DatePicker(
                                    "Time",
                                    selection: $viewModel.preferredTime,
                                    displayedComponents: .hourAndMinute
                                )
                                .labelsHidden()
                                .onChange(of: viewModel.preferredTime) { newTime in
                                    Task {
                                        await viewModel.updateNotificationTime(newTime)
                                    }
                                }
                            }

                            // Current setting display
                            HStack {
                                Text("Current Time")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text(viewModel.formattedPreferredTime)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                }

                // MARK: - Notification Types
                if viewModel.notificationsEnabled {
                    Section("Notification Types") {
                        Toggle("New Lessons", isOn: $viewModel.newLessonsEnabled)
                            .onChange(of: viewModel.newLessonsEnabled) { newValue in
                                Task {
                                    await viewModel.updateNotificationType(
                                        "new-lessons",
                                        enabled: newValue
                                    )
                                }
                            }

                        Toggle("Announcements", isOn: $viewModel.announcementsEnabled)
                            .onChange(of: viewModel.announcementsEnabled) { newValue in
                                Task {
                                    await viewModel.updateNotificationType(
                                        "announcements",
                                        enabled: newValue
                                    )
                                }
                            }

                        Toggle("Reminders", isOn: $viewModel.remindersEnabled)
                            .onChange(of: viewModel.remindersEnabled) { newValue in
                                Task {
                                    await viewModel.updateNotificationType(
                                        "reminders",
                                        enabled: newValue
                                    )
                                }
                            }
                    }
                }

                // MARK: - Category Preferences
                if viewModel.notificationsEnabled {
                    Section("Preferred Categories") {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Choose which lesson categories you'd like to receive")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            ForEach(LessonCategory.allCases, id: \.self) { category in
                                Toggle(category.description, isOn: Binding(
                                    get: {
                                        viewModel.preferredCategories.contains(category)
                                    },
                                    set: { isSelected in
                                        if isSelected {
                                            viewModel.preferredCategories.append(category)
                                        } else {
                                            viewModel.preferredCategories.removeAll {
                                                $0 == category
                                            }
                                        }

                                        Task {
                                            await viewModel.updatePreferredCategories()
                                        }
                                    }
                                ))
                            }
                        }
                    }
                }

                // MARK: - Status
                Section {
                    if viewModel.isLoading {
                        HStack {
                            ProgressView()
                            Text("Updating preferences...")
                                .foregroundColor(.secondary)
                        }
                    } else if let errorMessage = viewModel.errorMessage {
                        HStack(spacing: 12) {
                            Image(systemName: "exclamationmark.circle")
                                .foregroundColor(.red)
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    } else {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Preferences saved")
                                .foregroundColor(.secondary)
                        }
                    }
                }

                // MARK: - Debug Info (Development Only)
                #if DEBUG
                Section("Debug Info") {
                    Text("FCM Token: \(PushNotificationManager.shared.fcmToken ?? "Not set")")
                        .font(.caption)
                        .lineLimit(2)
                        .truncationMode(.middle)

                    Button("Reset Preferences") {
                        Task {
                            await viewModel.resetPreferences()
                        }
                    }
                    .foregroundColor(.red)
                }
                #endif
            }
            .navigationTitle("Notification Preferences")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
        .onAppear {
            Task {
                await viewModel.loadPreferences()
            }
        }
    }
}

// MARK: - Notification Preferences View Model
@MainActor
class NotificationPreferencesViewModel: ObservableObject {
    @Published var notificationsEnabled = true
    @Published var emailNotifications = true
    @Published var dailyLessonsEnabled = true
    @Published var newLessonsEnabled = true
    @Published var announcementsEnabled = true
    @Published var remindersEnabled = true
    @Published var preferredTime = Calendar.current.date(
        bySettingHour: 9,
        minute: 0,
        second: 0,
        of: Date()
    ) ?? Date()
    @Published var preferredCategories: [LessonCategory] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let authManager = AuthenticationManager.shared
    private let firebaseService = FirebaseService.shared

    // MARK: - Computed Properties

    var formattedPreferredTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.timeZone = TimeZone(abbreviation: "UTC")
        return formatter.string(from: preferredTime)
    }

    // MARK: - Loading

    func loadPreferences() async {
        isLoading = true
        errorMessage = nil

        do {
            guard let userId = authManager.currentUser?.id else {
                errorMessage = "User not authenticated"
                isLoading = false
                return
            }

            // Fetch user preferences from Firestore
            let userDoc = try await firebaseService.fetchUser(id: userId)

            await MainActor.run {
                self.notificationsEnabled = userDoc.preferences.notificationsEnabled
                self.emailNotifications = userDoc.preferences.emailNotifications

                // Parse preferred time
                if let timeString = userDoc.preferences.dailyReminderTime {
                    let components = timeString.split(separator: ":")
                    if components.count == 2,
                       let hour = Int(components[0]),
                       let minute = Int(components[1]) {
                        self.preferredTime = Calendar.current.date(
                            bySettingHour: hour,
                            minute: minute,
                            second: 0,
                            of: Date()
                        ) ?? Date()
                    }
                }

                self.preferredCategories = userDoc.preferences.preferredCategories
                self.isLoading = false
            }
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }

    // MARK: - Update Methods

    func updatePreference(key: String, value: Bool) async {
        isLoading = true
        errorMessage = nil

        guard let userId = authManager.currentUser?.id else {
            errorMessage = "User not authenticated"
            isLoading = false
            return
        }

        // TODO: Implement API call to update preference
        print("📝 Updating preference \(key) = \(value) for user \(userId)")
        isLoading = false
    }

    func updateDailyLessonsPreference(_ enabled: Bool) async {
        dailyLessonsEnabled = enabled

        if enabled {
            // Subscribe to daily-lessons topic
            await PushNotificationManager.shared.subscribeToTopic("daily-lessons")
        } else {
            // Unsubscribe from daily-lessons topic
            await PushNotificationManager.shared.unsubscribeFromTopic("daily-lessons")
        }

        await updatePreference(key: "dailyLessonsEnabled", value: enabled)
    }

    func updateNotificationTime(_ time: Date) async {
        isLoading = true
        errorMessage = nil

        guard let userId = authManager.currentUser?.id else {
            errorMessage = "User not authenticated"
            isLoading = false
            return
        }

        // Format time as HH:mm UTC
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.timeZone = TimeZone(abbreviation: "UTC")
        let timeString = formatter.string(from: time)

        // TODO: Implement API call to update notification time
        print("✓ Notification time updated to: \(timeString) for user \(userId)")
        isLoading = false
    }

    func updateNotificationType(_ type: String, enabled: Bool) async {
        isLoading = true
        errorMessage = nil

        // TODO: Implement API call to update notification type
        print("📝 Updating notification type \(type) = \(enabled)")
        isLoading = false
    }

    func updatePreferredCategories() async {
        isLoading = true
        errorMessage = nil

        guard let userId = authManager.currentUser?.id else {
            errorMessage = "User not authenticated"
            isLoading = false
            return
        }

        let categories = preferredCategories.map { $0.rawValue }
        // TODO: Implement API call to update preferred categories
        print("📝 Updating preferred categories: \(categories) for user \(userId)")
        isLoading = false
    }

    // MARK: - Reset

    func resetPreferences() async {
        isLoading = true
        errorMessage = nil

        do {
            // Reset to defaults
            notificationsEnabled = true
            emailNotifications = true
            dailyLessonsEnabled = true
            newLessonsEnabled = true
            announcementsEnabled = true
            remindersEnabled = true
            preferredTime = Calendar.current.date(
                bySettingHour: 9,
                minute: 0,
                second: 0,
                of: Date()
            ) ?? Date()
            preferredCategories = []

            isLoading = false
            print("✓ Preferences reset to defaults")
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

// MARK: - Preview
#Preview {
    NotificationPreferencesView(viewModel: NotificationPreferencesViewModel())
}
