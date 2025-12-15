import SwiftUI

// MARK: - Main Tab View
struct MainTabView: View {
    @StateObject private var lessonsViewModel = LessonsViewModel()
    @StateObject private var onboardingManager = OnboardingManager.shared
    @State private var selectedTab: Tab = .home
    @Environment(\.colorScheme) var colorScheme

    enum Tab {
        case home
        case lessons
        case profile
    }

    var body: some View {
        Group {
            if onboardingManager.hasCompletedOnboarding {
                TabView(selection: $selectedTab) {
                    // Home Tab
                    HomeView(lessonsViewModel: lessonsViewModel, onboardingManager: onboardingManager)
                        .tabItem {
                            Label("Home", systemImage: "house.fill")
                        }
                        .tag(Tab.home)

                    // Lessons Tab
                    LessonsListView(viewModel: lessonsViewModel)
                        .tabItem {
                            Label("Lessons", systemImage: "book.fill")
                        }
                        .tag(Tab.lessons)

                    // Profile Tab
                    ProfileView()
                        .tabItem {
                            Label("Profile", systemImage: "person.fill")
                        }
                        .tag(Tab.profile)
                }
                .tint(AppTheme.Colors.royalGold)
                .task {
                    await lessonsViewModel.loadLessons()
                }
            } else {
                OnboardingView(onboardingManager: onboardingManager)
            }
        }
    }
}

// MARK: - Home View
struct HomeView: View {
    @ObservedObject var lessonsViewModel: LessonsViewModel
    @ObservedObject var onboardingManager: OnboardingManager
    @State private var selectedProblem: ProblemCategory?
    @Environment(\.colorScheme) var colorScheme

    // Personalized lessons based on user's primary challenge
    var personalizedLessons: [Lesson] {
        if let challenge = onboardingManager.primaryChallenge {
            let filtered = lessonsViewModel.getLessonsForProblem(challenge)
            return filtered.isEmpty ? Array(lessonsViewModel.lessons.prefix(5)) : Array(filtered.prefix(5))
        }
        return Array(lessonsViewModel.lessons.prefix(5))
    }

    // Ordered problem categories - user's challenge first
    var orderedProblems: [ProblemCategory] {
        var problems = Array(ProblemCategory.allCases.prefix(6))
        if let challenge = onboardingManager.primaryChallenge,
           let index = problems.firstIndex(of: challenge) {
            problems.remove(at: index)
            problems.insert(challenge, at: 0)
        }
        return problems
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.xxl) {
                    // Personalized Welcome Header
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        if !onboardingManager.userName.isEmpty {
                            Text("Welcome back, \(onboardingManager.userName)")
                                .font(AppTheme.Typography.callout)
                                .foregroundColor(AppTheme.Colors.burntOrange)
                        }

                        Text("What's Troubling You?")
                            .font(AppTheme.Typography.largeTitle)
                            .foregroundColor(AppTheme.Colors.primaryText)

                        Text("Find biblical wisdom for your business challenges")
                            .font(AppTheme.Typography.callout)
                            .foregroundColor(AppTheme.Colors.secondaryText)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, AppTheme.Spacing.xl)
                    .padding(.top, AppTheme.Spacing.lg)

                    // Personalized "For You" Section (if user has a primary challenge)
                    if let challenge = onboardingManager.primaryChallenge, !personalizedLessons.isEmpty {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("For You")
                                        .sectionHeader()
                                    Text("Based on: \(challenge.displayText.replacingOccurrences(of: "?", with: ""))")
                                        .font(AppTheme.Typography.smallCaption)
                                        .foregroundColor(AppTheme.Colors.burntOrange)
                                }
                                Spacer()
                                NavigationLink(destination: ProblemLessonsView(problem: challenge, viewModel: lessonsViewModel)) {
                                    Text("See All")
                                        .font(AppTheme.Typography.callout)
                                        .foregroundColor(AppTheme.Colors.burntOrange)
                                }
                            }
                            .padding(.horizontal, AppTheme.Spacing.xl)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: AppTheme.Spacing.lg) {
                                    ForEach(personalizedLessons) { lesson in
                                        NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: lessonsViewModel)) {
                                            ProblemFirstLessonCard(lesson: lesson)
                                        }
                                    }
                                }
                                .padding(.horizontal, AppTheme.Spacing.xl)
                            }
                        }
                    }

                    // Problem Categories Grid - THE MAIN ENTRY POINT
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        Text("Explore Challenges")
                            .sectionHeader()
                            .padding(.horizontal, AppTheme.Spacing.xl)

                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: AppTheme.Spacing.md) {
                            ForEach(orderedProblems, id: \.self) { problem in
                                NavigationLink(destination: ProblemLessonsView(problem: problem, viewModel: lessonsViewModel)) {
                                    ProblemCardView(
                                        problem: problem,
                                        isHighlighted: problem == onboardingManager.primaryChallenge
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, AppTheme.Spacing.xl)
                    }

                    // Recent Solutions (if no personalized section shown)
                    if onboardingManager.primaryChallenge == nil {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                            HStack {
                                Text("Solutions For You")
                                    .sectionHeader()
                                Spacer()
                                NavigationLink("See All") {
                                    LessonsListView(viewModel: lessonsViewModel)
                                }
                                .font(AppTheme.Typography.callout)
                                .foregroundColor(AppTheme.Colors.burntOrange)
                            }
                            .padding(.horizontal, AppTheme.Spacing.xl)

                            if lessonsViewModel.isLoading {
                                ProgressView()
                                    .tint(AppTheme.Colors.burntOrange)
                                    .frame(maxWidth: .infinity, alignment: .center)
                                    .padding(.vertical, AppTheme.Spacing.xxxl)
                            } else {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: AppTheme.Spacing.lg) {
                                        ForEach(lessonsViewModel.lessons.prefix(5)) { lesson in
                                            NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: lessonsViewModel)) {
                                                ProblemFirstLessonCard(lesson: lesson)
                                            }
                                        }
                                    }
                                    .padding(.horizontal, AppTheme.Spacing.xl)
                                }
                            }
                        }
                    }

                    // Browse by Biblical Category (Secondary)
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        Text("Browse by Topic")
                            .font(AppTheme.Typography.callout)
                            .foregroundColor(AppTheme.Colors.secondaryText)
                            .padding(.horizontal, AppTheme.Spacing.xl)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: AppTheme.Spacing.sm) {
                                ForEach(LessonCategory.allCases, id: \.self) { category in
                                    Button(action: {
                                        Task {
                                            await lessonsViewModel.loadLessonsByCategory(category)
                                        }
                                    }) {
                                        Text(category.description)
                                            .categoryBadge(color: AppTheme.Colors.deepTeal)
                                    }
                                }
                            }
                            .padding(.horizontal, AppTheme.Spacing.xl)
                        }
                    }

                    Spacer(minLength: AppTheme.Spacing.xxxl)
                }
            }
            .background(
                colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
            )
        }
    }
}

// MARK: - Problem Card View
struct ProblemCardView: View {
    let problem: ProblemCategory
    var isHighlighted: Bool = false
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack {
                Image(systemName: problem.icon)
                    .font(.system(size: 24))
                    .foregroundColor(isHighlighted ? .white : AppTheme.Colors.burntOrange)

                if isHighlighted {
                    Spacer()
                    Text("Your Focus")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.white.opacity(0.9))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.white.opacity(0.25)))
                }
            }

            Text(problem.displayText)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(isHighlighted ? .white : AppTheme.Colors.primaryText)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .frame(height: 90)
        .padding(AppTheme.Spacing.md)
        .background(
            Group {
                if isHighlighted {
                    AppTheme.Gradients.primaryButton
                } else {
                    colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground
                }
            }
        )
        .cornerRadius(AppTheme.CornerRadius.medium)
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                .stroke(isHighlighted ? AppTheme.Colors.burntOrange : AppTheme.Colors.burntOrange.opacity(0.2), lineWidth: isHighlighted ? 2 : 1)
        )
    }
}

// MARK: - Problem-First Lesson Card
struct ProblemFirstLessonCard: View {
    let lesson: Lesson
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            // Problem hook at the top - THIS IS WHAT GRABS ATTENTION
            if let hook = lesson.problemHook {
                Text(hook)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(AppTheme.Colors.burntOrange)
                    .lineLimit(1)
            } else {
                // Fallback to first problem tag
                if let firstProblem = lesson.problemTags.first {
                    Text(firstProblem.displayText)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(AppTheme.Colors.burntOrange)
                        .lineLimit(1)
                }
            }

            // Benefit statement or title
            if let benefit = lesson.benefitStatement {
                Text(benefit)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            } else {
                Text(lesson.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }

            Spacer()

            // Biblical reference (secondary)
            HStack {
                Text(lesson.category.description)
                    .font(AppTheme.Typography.smallCaption)
                    .foregroundColor(AppTheme.Colors.secondaryText)

                Spacer()

                if let duration = lesson.duration {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                        Text("\(duration) min")
                    }
                    .font(AppTheme.Typography.smallCaption)
                    .foregroundColor(AppTheme.Colors.secondaryText)
                }
            }
        }
        .frame(height: 130)
        .frame(width: 180)
        .premiumCard(padding: AppTheme.Spacing.md)
    }
}

// MARK: - Problem Lessons View (Shows lessons for a specific problem)
struct ProblemLessonsView: View {
    let problem: ProblemCategory
    @ObservedObject var viewModel: LessonsViewModel
    @Environment(\.colorScheme) var colorScheme

    var lessonsForProblem: [Lesson] {
        viewModel.getLessonsForProblem(problem)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                // Problem Header
                VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                    Image(systemName: problem.icon)
                        .font(.system(size: 32))
                        .foregroundColor(AppTheme.Colors.burntOrange)

                    Text(problem.displayText)
                        .font(AppTheme.Typography.title)
                        .foregroundColor(AppTheme.Colors.primaryText)

                    Text("Biblical wisdom for this challenge")
                        .font(AppTheme.Typography.callout)
                        .foregroundColor(AppTheme.Colors.secondaryText)
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.lg)

                // Lessons for this problem
                if lessonsForProblem.isEmpty {
                    VStack(spacing: AppTheme.Spacing.md) {
                        Image(systemName: "book.closed")
                            .font(.system(size: 48))
                            .foregroundColor(AppTheme.Colors.warmGray)

                        Text("Lessons coming soon")
                            .font(AppTheme.Typography.headline)
                            .foregroundColor(AppTheme.Colors.primaryText)

                        Text("We're preparing biblical wisdom for this challenge")
                            .font(AppTheme.Typography.caption)
                            .foregroundColor(AppTheme.Colors.secondaryText)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppTheme.Spacing.xxxl)
                } else {
                    LazyVStack(spacing: AppTheme.Spacing.sm) {
                        ForEach(lessonsForProblem) { lesson in
                            NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: viewModel)) {
                                ProblemFirstLessonRow(lesson: lesson, isCompleted: viewModel.isLessonCompleted(lesson.id))
                            }
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.lg)
                }

                Spacer(minLength: AppTheme.Spacing.xxxl)
            }
        }
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
        )
        .navigationTitle(problem.rawValue)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Problem-First Lesson Row
struct ProblemFirstLessonRow: View {
    let lesson: Lesson
    let isCompleted: Bool
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                // Hook first
                if let hook = lesson.problemHook {
                    Text(hook)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(AppTheme.Colors.burntOrange)
                }

                // Benefit or title
                Text(lesson.benefitStatement ?? lesson.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                HStack(spacing: AppTheme.Spacing.sm) {
                    Text(lesson.category.description)
                        .font(AppTheme.Typography.smallCaption)
                        .foregroundColor(AppTheme.Colors.warmGray)

                    if let duration = lesson.duration {
                        Text("•")
                            .foregroundColor(AppTheme.Colors.warmGray)

                        Text("\(duration) min")
                            .font(AppTheme.Typography.smallCaption)
                            .foregroundColor(AppTheme.Colors.warmGray)
                    }
                }
            }

            Spacer()

            if isCompleted {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(AppTheme.Colors.successGreen)
                    .font(.system(size: 20))
            }
        }
        .padding(AppTheme.Spacing.md)
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground
        )
        .cornerRadius(AppTheme.CornerRadius.medium)
    }
}

// MARK: - Lessons List View
struct LessonsListView: View {
    @ObservedObject var viewModel: LessonsViewModel
    @State private var searchText = ""
    @State private var selectedCategory: LessonCategory?
    @State private var showFilters = false
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        NavigationView {
            VStack(spacing: AppTheme.Spacing.md) {
                // Search Bar
                HStack(spacing: AppTheme.Spacing.sm) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(AppTheme.Colors.warmGray)

                    TextField("Search lessons", text: $searchText)
                        .onChange(of: searchText) { newValue in
                            viewModel.search(text: newValue)
                        }

                    if !searchText.isEmpty {
                        Button(action: {
                            searchText = ""
                            viewModel.clearFilters()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(AppTheme.Colors.warmGray)
                        }
                    }
                }
                .premiumInput()
                .padding(.horizontal, AppTheme.Spacing.lg)
                .padding(.top, AppTheme.Spacing.sm)

                // Lessons List
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                        .tint(AppTheme.Colors.royalGold)
                    Spacer()
                } else if viewModel.filteredLessons.isEmpty {
                    Spacer()
                    VStack(spacing: AppTheme.Spacing.md) {
                        Image(systemName: "book.closed")
                            .font(.system(size: 48))
                            .foregroundColor(AppTheme.Colors.warmGray)

                        Text("No lessons found")
                            .font(AppTheme.Typography.headline)
                            .foregroundColor(AppTheme.Colors.primaryText)

                        Text("Try adjusting your search or filters")
                            .font(AppTheme.Typography.caption)
                            .foregroundColor(AppTheme.Colors.secondaryText)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: AppTheme.Spacing.sm) {
                            ForEach(viewModel.filteredLessons) { lesson in
                                NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: viewModel)) {
                                    LessonRowView(lesson: lesson, isCompleted: viewModel.isLessonCompleted(lesson.id))
                                }
                            }
                        }
                        .padding(.horizontal, AppTheme.Spacing.lg)
                    }
                }
            }
            .background(
                colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
            )
            .navigationTitle("Lessons")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Profile View
struct ProfileView: View {
    @StateObject private var authManager = AuthenticationManager.shared
    @State private var showNotificationPreferences = false
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.xl) {
                    if let user = authManager.currentUser {
                        // Profile Header
                        VStack(spacing: AppTheme.Spacing.md) {
                            PremiumAvatar(
                                initial: String(user.displayName?.prefix(1) ?? "U"),
                                size: 80
                            )

                            Text(user.displayName ?? "User")
                                .font(AppTheme.Typography.headline)
                                .foregroundColor(AppTheme.Colors.primaryText)

                            Text(user.email)
                                .font(AppTheme.Typography.caption)
                                .foregroundColor(AppTheme.Colors.secondaryText)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppTheme.Spacing.xxl)
                        .background(
                            colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground
                        )
                        .cornerRadius(AppTheme.CornerRadius.large)
                        .padding(.horizontal, AppTheme.Spacing.lg)
                        .padding(.top, AppTheme.Spacing.lg)

                        // Stats Grid
                        VStack(spacing: AppTheme.Spacing.md) {
                            HStack(spacing: AppTheme.Spacing.md) {
                                PremiumStatCard(
                                    title: "Completed",
                                    value: "\(user.stats?.lessonsCompleted ?? 0)",
                                    icon: "checkmark.circle.fill"
                                )
                                PremiumStatCard(
                                    title: "Time Spent",
                                    value: "\(user.stats?.totalTimeSpent ?? 0) min",
                                    icon: "clock.fill"
                                )
                            }

                            HStack(spacing: AppTheme.Spacing.md) {
                                PremiumStatCard(
                                    title: "Streak",
                                    value: "\(user.stats?.currentStreak ?? 0) days",
                                    icon: "flame.fill"
                                )
                                PremiumStatCard(
                                    title: "Favorites",
                                    value: "\(user.stats?.favoriteCount ?? 0)",
                                    icon: "heart.fill"
                                )
                            }
                        }
                        .padding(.horizontal, AppTheme.Spacing.lg)

                        // Settings Buttons
                        VStack(spacing: AppTheme.Spacing.md) {
                            // Notification Preferences Button
                            Button(action: {
                                showNotificationPreferences = true
                            }) {
                                HStack {
                                    Image(systemName: "bell.badge.fill")
                                        .foregroundColor(AppTheme.Colors.royalGold)
                                    Text("Notification Preferences")
                                        .foregroundColor(AppTheme.Colors.primaryText)
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .foregroundColor(AppTheme.Colors.warmGray)
                                }
                                .padding(AppTheme.Spacing.md)
                                .background(
                                    colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground
                                )
                                .cornerRadius(AppTheme.CornerRadius.medium)
                            }

                            // Sign Out Button
                            Button(action: {
                                authManager.signOut()
                            }) {
                                HStack {
                                    Image(systemName: "rectangle.portrait.and.arrow.right")
                                    Text("Sign Out")
                                }
                                .frame(maxWidth: .infinity)
                                .padding(AppTheme.Spacing.md)
                                .background(AppTheme.Colors.richBurgundy.opacity(0.12))
                                .foregroundColor(AppTheme.Colors.richBurgundy)
                                .cornerRadius(AppTheme.CornerRadius.medium)
                            }
                        }
                        .padding(.horizontal, AppTheme.Spacing.lg)
                        .padding(.top, AppTheme.Spacing.lg)

                        Spacer(minLength: AppTheme.Spacing.xxxl)
                    }
                }
            }
            .background(
                colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
            )
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showNotificationPreferences) {
                NotificationPreferencesView(viewModel: NotificationPreferencesViewModel())
            }
        }
    }
}

// MARK: - Supporting Views

struct LessonCardView: View {
    let lesson: Lesson
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text(lesson.category.description)
                .categoryBadge()

            Text(lesson.title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(AppTheme.Colors.primaryText)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            Spacer()

            HStack {
                Text(lesson.difficulty.displayName)
                    .font(AppTheme.Typography.smallCaption)
                    .foregroundColor(AppTheme.Colors.secondaryText)

                Spacer()

                if let duration = lesson.duration {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                        Text("\(duration) min")
                    }
                    .font(AppTheme.Typography.smallCaption)
                    .foregroundColor(AppTheme.Colors.secondaryText)
                }
            }
        }
        .frame(height: 140)
        .frame(width: 170)
        .premiumCard(padding: AppTheme.Spacing.md)
    }
}

struct LessonRowView: View {
    let lesson: Lesson
    let isCompleted: Bool
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(lesson.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                HStack(spacing: AppTheme.Spacing.sm) {
                    Text(lesson.category.description)
                        .font(AppTheme.Typography.smallCaption)
                        .foregroundColor(AppTheme.Colors.warmGray)

                    if let duration = lesson.duration {
                        Text("•")
                            .foregroundColor(AppTheme.Colors.warmGray)

                        Text("\(duration) min")
                            .font(AppTheme.Typography.smallCaption)
                            .foregroundColor(AppTheme.Colors.warmGray)
                    }
                }
            }

            Spacer()

            if isCompleted {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(AppTheme.Colors.successGreen)
                    .font(.system(size: 20))
            }
        }
        .padding(AppTheme.Spacing.md)
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground
        )
        .cornerRadius(AppTheme.CornerRadius.medium)
    }
}

struct StatCardView: View {
    let title: String
    let value: String

    var body: some View {
        PremiumStatCard(title: title, value: value)
    }
}

#Preview {
    MainTabView()
}
