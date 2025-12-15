import SwiftUI

// MARK: - Notification Preferences View
struct NotificationPreferencesView: View {
    @ObservedObject var viewModel: NotificationPreferencesViewModel
    @Environment(\.presentationMode) var presentationMode
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.xl) {
                    // MARK: - General Settings
                    PreferenceSection(title: "General") {
                        PremiumToggleRow(
                            title: "Enable Notifications",
                            icon: "bell.fill",
                            iconColor: AppTheme.Colors.royalGold,
                            isOn: $viewModel.notificationsEnabled
                        ) { newValue in
                            Task {
                                await viewModel.updatePreference(
                                    key: "notificationsEnabled",
                                    value: newValue
                                )
                            }
                        }

                        if viewModel.notificationsEnabled {
                            Divider()
                                .padding(.horizontal, AppTheme.Spacing.md)

                            PremiumToggleRow(
                                title: "Email Notifications",
                                icon: "envelope.fill",
                                iconColor: AppTheme.Colors.amberGlow,
                                isOn: $viewModel.emailNotifications
                            ) { newValue in
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
                        PreferenceSection(title: "Daily Lesson Reminders") {
                            PremiumToggleRow(
                                title: "Daily Lessons",
                                icon: "book.fill",
                                iconColor: AppTheme.Colors.successGreen,
                                isOn: $viewModel.dailyLessonsEnabled
                            ) { newValue in
                                Task {
                                    await viewModel.updateDailyLessonsPreference(newValue)
                                }
                            }

                            if viewModel.dailyLessonsEnabled {
                                Divider()
                                    .padding(.horizontal, AppTheme.Spacing.md)

                                // Time Picker
                                HStack {
                                    HStack(spacing: AppTheme.Spacing.sm) {
                                        Image(systemName: "clock.fill")
                                            .foregroundColor(AppTheme.Colors.royalGold)
                                        Text("Preferred Time")
                                            .font(AppTheme.Typography.body)
                                            .foregroundColor(AppTheme.Colors.primaryText)
                                    }
                                    Spacer()
                                    DatePicker(
                                        "Time",
                                        selection: $viewModel.preferredTime,
                                        displayedComponents: .hourAndMinute
                                    )
                                    .labelsHidden()
                                    .tint(AppTheme.Colors.royalGold)
                                    .onChange(of: viewModel.preferredTime) { newTime in
                                        Task {
                                            await viewModel.updateNotificationTime(newTime)
                                        }
                                    }
                                }
                                .padding(AppTheme.Spacing.md)

                                Divider()
                                    .padding(.horizontal, AppTheme.Spacing.md)

                                // Current setting display
                                HStack {
                                    Text("Current Time")
                                        .font(AppTheme.Typography.body)
                                        .foregroundColor(AppTheme.Colors.secondaryText)
                                    Spacer()
                                    Text(viewModel.formattedPreferredTime)
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(AppTheme.Colors.royalGold)
                                }
                                .padding(AppTheme.Spacing.md)
                            }
                        }
                    }

                    // MARK: - Notification Types
                    if viewModel.notificationsEnabled {
                        PreferenceSection(title: "Notification Types") {
                            PremiumToggleRow(
                                title: "New Lessons",
                                icon: "sparkles",
                                iconColor: AppTheme.Colors.amberGlow,
                                isOn: $viewModel.newLessonsEnabled
                            ) { newValue in
                                Task {
                                    await viewModel.updateNotificationType(
                                        "new-lessons",
                                        enabled: newValue
                                    )
                                }
                            }

                            Divider()
                                .padding(.horizontal, AppTheme.Spacing.md)

                            PremiumToggleRow(
                                title: "Announcements",
                                icon: "megaphone.fill",
                                iconColor: AppTheme.Colors.richBurgundy,
                                isOn: $viewModel.announcementsEnabled
                            ) { newValue in
                                Task {
                                    await viewModel.updateNotificationType(
                                        "announcements",
                                        enabled: newValue
                                    )
                                }
                            }

                            Divider()
                                .padding(.horizontal, AppTheme.Spacing.md)

                            PremiumToggleRow(
                                title: "Reminders",
                                icon: "bell.badge.fill",
                                iconColor: AppTheme.Colors.successGreen,
                                isOn: $viewModel.remindersEnabled
                            ) { newValue in
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
                        PreferenceSection(title: "Preferred Categories") {
                            VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                                Text("Choose which lesson categories you'd like to receive")
                                    .font(AppTheme.Typography.caption)
                                    .foregroundColor(AppTheme.Colors.secondaryText)
                                    .padding(.horizontal, AppTheme.Spacing.md)
                                    .padding(.top, AppTheme.Spacing.sm)

                                ForEach(Array(LessonCategory.allCases.enumerated()), id: \.element) { index, category in
                                    if index > 0 {
                                        Divider()
                                            .padding(.horizontal, AppTheme.Spacing.md)
                                    }

                                    PremiumToggleRow(
                                        title: category.description,
                                        icon: categoryIcon(for: category),
                                        iconColor: AppTheme.Colors.royalGold,
                                        isOn: Binding(
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
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // MARK: - Status
                    if viewModel.isLoading {
                        HStack(spacing: AppTheme.Spacing.sm) {
                            ProgressView()
                                .tint(AppTheme.Colors.royalGold)
                            Text("Updating preferences...")
                                .font(AppTheme.Typography.caption)
                                .foregroundColor(AppTheme.Colors.secondaryText)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(AppTheme.Spacing.md)
                    } else if let errorMessage = viewModel.errorMessage {
                        ErrorMessageView(message: errorMessage)
                            .padding(.horizontal, AppTheme.Spacing.lg)
                    } else {
                        HStack(spacing: AppTheme.Spacing.sm) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(AppTheme.Colors.successGreen)
                            Text("Preferences saved")
                                .font(AppTheme.Typography.caption)
                                .foregroundColor(AppTheme.Colors.secondaryText)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(AppTheme.Spacing.md)
                    }

                    // MARK: - Debug Info (Development Only)
                    #if DEBUG
                    PreferenceSection(title: "Debug Info") {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                            Text("FCM Token:")
                                .font(AppTheme.Typography.caption)
                                .foregroundColor(AppTheme.Colors.secondaryText)
                            Text(PushNotificationManager.shared.fcmToken ?? "Not set")
                                .font(AppTheme.Typography.smallCaption)
                                .foregroundColor(AppTheme.Colors.warmGray)
                                .lineLimit(2)
                                .truncationMode(.middle)
                        }
                        .padding(AppTheme.Spacing.md)

                        Divider()
                            .padding(.horizontal, AppTheme.Spacing.md)

                        Button(action: {
                            Task {
                                await viewModel.resetPreferences()
                            }
                        }) {
                            HStack {
                                Image(systemName: "arrow.counterclockwise")
                                Text("Reset Preferences")
                            }
                            .font(AppTheme.Typography.body)
                            .foregroundColor(AppTheme.Colors.richBurgundy)
                            .frame(maxWidth: .infinity)
                            .padding(AppTheme.Spacing.md)
                        }
                    }
                    #endif

                    Spacer(minLength: AppTheme.Spacing.xxxl)
                }
                .padding(.top, AppTheme.Spacing.lg)
            }
            .background(
                colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
            )
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(AppTheme.Colors.royalGold)
                }
            }
        }
        .onAppear {
            Task {
                await viewModel.loadPreferences()
            }
        }
    }

    // Helper function to get icon for each category
    private func categoryIcon(for category: LessonCategory) -> String {
        switch category {
        case .leadership:
            return "person.3.fill"
        case .stewardship:
            return "dollarsign.circle.fill"
        case .integrity:
            return "shield.fill"
        case .perseverance:
            return "figure.climbing"
        case .wisdom:
            return "lightbulb.fill"
        case .trust:
            return "hands.sparkles.fill"
        case .service:
            return "hand.raised.fill"
        case .community:
            return "person.2.fill"
        case .timeManagement:
            return "clock.fill"
        case .decision:
            return "arrow.triangle.branch"
        }
    }
}

// MARK: - Supporting Views

struct PreferenceSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(AppTheme.Colors.secondaryText)
                .tracking(0.5)
                .padding(.horizontal, AppTheme.Spacing.xl)

            VStack(spacing: 0) {
                content
            }
            .background(
                colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground
            )
            .cornerRadius(AppTheme.CornerRadius.large)
            .padding(.horizontal, AppTheme.Spacing.lg)
        }
    }
}

struct PremiumToggleRow: View {
    let title: String
    let icon: String
    let iconColor: Color
    @Binding var isOn: Bool
    var onChange: ((Bool) -> Void)?

    init(title: String, icon: String, iconColor: Color, isOn: Binding<Bool>, onChange: ((Bool) -> Void)? = nil) {
        self.title = title
        self.icon = icon
        self.iconColor = iconColor
        self._isOn = isOn
        self.onChange = onChange
    }

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(iconColor)
                .frame(width: 24)

            Text(title)
                .font(AppTheme.Typography.body)
                .foregroundColor(AppTheme.Colors.primaryText)

            Spacer()

            Toggle("", isOn: $isOn)
                .tint(AppTheme.Colors.royalGold)
                .labelsHidden()
                .onChange(of: isOn) { newValue in
                    onChange?(newValue)
                }
        }
        .padding(AppTheme.Spacing.md)
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
        print("Updating preference \(key) = \(value) for user \(userId)")
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
        print("Notification time updated to: \(timeString) for user \(userId)")
        isLoading = false
    }

    func updateNotificationType(_ type: String, enabled: Bool) async {
        isLoading = true
        errorMessage = nil

        // TODO: Implement API call to update notification type
        print("Updating notification type \(type) = \(enabled)")
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
        print("Updating preferred categories: \(categories) for user \(userId)")
        isLoading = false
    }

    // MARK: - Reset

    func resetPreferences() async {
        isLoading = true
        errorMessage = nil

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
        print("Preferences reset to defaults")
    }
}

// MARK: - Preview
#Preview {
    NotificationPreferencesView(viewModel: NotificationPreferencesViewModel())
}
