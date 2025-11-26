import SwiftUI

// MARK: - Main Tab View
struct MainTabView: View {
    @StateObject private var lessonsViewModel = LessonsViewModel()
    @State private var selectedTab: Tab = .home

    enum Tab {
        case home
        case lessons
        case profile
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            HomeView(lessonsViewModel: lessonsViewModel)
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
        .task {
            await lessonsViewModel.loadLessons()
        }
    }
}

// MARK: - Home View
struct HomeView: View {
    @ObservedObject var lessonsViewModel: LessonsViewModel

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Welcome back")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.primary)

                    Text("Continue your biblical journey in entrepreneurship")
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 20)

                // Recent Lessons
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Recent Lessons")
                            .font(.headline)
                        Spacer()
                        NavigationLink("See All") {
                            LessonsListView(viewModel: lessonsViewModel)
                        }
                        .font(.caption)
                        .foregroundColor(.blue)
                    }

                    if lessonsViewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, alignment: .center)
                    } else {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(lessonsViewModel.lessons.prefix(5)) { lesson in
                                    NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: lessonsViewModel)) {
                                        LessonCardView(lesson: lesson)
                                    }
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                }

                // Categories
                VStack(alignment: .leading, spacing: 12) {
                    Text("Categories")
                        .font(.headline)
                        .padding(.horizontal, 20)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(LessonCategory.allCases, id: \.self) { category in
                                Button(action: {
                                    Task {
                                        await lessonsViewModel.loadLessonsByCategory(category)
                                    }
                                }) {
                                    Text(category.description)
                                        .font(.caption)
                                        .padding(8)
                                        .background(Color.blue.opacity(0.1))
                                        .foregroundColor(.blue)
                                        .cornerRadius(6)
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }

                Spacer()
            }
            .padding(.vertical, 20)
        }
    }
}

// MARK: - Lessons List View
struct LessonsListView: View {
    @ObservedObject var viewModel: LessonsViewModel
    @State private var searchText = ""
    @State private var selectedCategory: LessonCategory?
    @State private var showFilters = false

    var body: some View {
        NavigationView {
            VStack(spacing: 12) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)

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
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding(8)
                .background(Color(.systemGray6))
                .cornerRadius(8)
                .padding(.horizontal, 16)

                // Lessons List
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                } else if viewModel.filteredLessons.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "book.closed")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)

                        Text("No lessons found")
                            .font(.headline)
                            .foregroundColor(.gray)

                        Text("Try adjusting your search or filters")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                } else {
                    List {
                        ForEach(viewModel.filteredLessons) { lesson in
                            NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: viewModel)) {
                                LessonRowView(lesson: lesson, isCompleted: viewModel.isLessonCompleted(lesson.id))
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Lessons")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Profile View
struct ProfileView: View {
    @StateObject private var authManager = AuthenticationManager.shared
    @State private var showNotificationPreferences = false

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                if let user = authManager.currentUser {
                    VStack(spacing: 12) {
                        Circle()
                            .fill(Color.blue.opacity(0.3))
                            .frame(width: 80, height: 80)
                            .overlay(
                                Text(String(user.displayName?.prefix(1) ?? "U"))
                                    .font(.system(size: 32, weight: .bold))
                                    .foregroundColor(.blue)
                            )

                        Text(user.displayName ?? "User")
                            .font(.headline)

                        Text(user.email)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(20)
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(16)

                    // Stats
                    VStack(spacing: 12) {
                        HStack {
                            StatCardView(title: "Completed", value: "\(user.stats?.lessonsCompleted ?? 0)")
                            StatCardView(title: "Time Spent", value: "\(user.stats?.totalTimeSpent ?? 0) min")
                        }

                        HStack {
                            StatCardView(title: "Streak", value: "\(user.stats?.currentStreak ?? 0) days")
                            StatCardView(title: "Favorites", value: "\(user.stats?.favoriteCount ?? 0)")
                        }
                    }
                    .padding(.horizontal, 16)

                    // Settings Buttons
                    VStack(spacing: 12) {
                        // Notification Preferences Button
                        Button(action: {
                            showNotificationPreferences = true
                        }) {
                            HStack {
                                Image(systemName: "bell.badge.fill")
                                Text("Notification Preferences")
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(12)
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(8)
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
                            .padding(12)
                            .background(Color.red.opacity(0.1))
                            .foregroundColor(.red)
                            .cornerRadius(8)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 20)

                    Spacer()
                }
            }
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

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(lesson.category.description)
                .font(.caption)
                .foregroundColor(.blue)
                .padding(4)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(4)

            Text(lesson.title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .lineLimit(2)

            Spacer()

            HStack {
                Text(lesson.difficulty.displayName)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                if let duration = lesson.duration {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                        Text("\(duration) min")
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                }
            }
        }
        .frame(height: 140)
        .padding(12)
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .frame(width: 160)
    }
}

struct LessonRowView: View {
    let lesson: Lesson
    let isCompleted: Bool

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(lesson.title)
                    .font(.headline)
                    .lineLimit(2)

                HStack(spacing: 8) {
                    Text(lesson.category.description)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if let duration = lesson.duration {
                        Text("•")
                            .foregroundColor(.secondary)

                        Text("\(duration) min")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            if isCompleted {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            }
        }
        .padding(.vertical, 8)
    }
}

struct StatCardView: View {
    let title: String
    let value: String

    var body: some View {
        VStack(spacing: 8) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

#Preview {
    MainTabView()
}
