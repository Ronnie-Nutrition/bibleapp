import SwiftUI

// MARK: - Saved Lessons View
struct SavedLessonsView: View {
    @ObservedObject var viewModel: LessonsViewModel
    @ObservedObject var bookmarksManager: BookmarksManager
    @Environment(\.colorScheme) var colorScheme

    var savedLessons: [Lesson] {
        bookmarksManager.getBookmarkedLessons(from: viewModel.lessons)
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    // Header
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        Text("Saved Lessons")
                            .font(AppTheme.Typography.largeTitle)
                            .foregroundColor(AppTheme.Colors.primaryText)

                        Text("\(savedLessons.count) lesson\(savedLessons.count == 1 ? "" : "s") saved")
                            .font(AppTheme.Typography.callout)
                            .foregroundColor(AppTheme.Colors.secondaryText)
                    }
                    .padding(.horizontal, AppTheme.Spacing.xl)
                    .padding(.top, AppTheme.Spacing.lg)

                    if savedLessons.isEmpty {
                        // Empty State
                        VStack(spacing: AppTheme.Spacing.lg) {
                            Spacer()
                                .frame(height: 60)

                            Image(systemName: "bookmark")
                                .font(.system(size: 64))
                                .foregroundColor(AppTheme.Colors.warmGray)

                            Text("No Saved Lessons")
                                .font(AppTheme.Typography.headline)
                                .foregroundColor(AppTheme.Colors.primaryText)

                            Text("Tap the bookmark icon on any lesson to save it for later")
                                .font(AppTheme.Typography.callout)
                                .foregroundColor(AppTheme.Colors.secondaryText)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, AppTheme.Spacing.xxxl)

                            Spacer()
                        }
                        .frame(maxWidth: .infinity)
                    } else {
                        // Saved Lessons List
                        LazyVStack(spacing: AppTheme.Spacing.md) {
                            ForEach(savedLessons) { lesson in
                                NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: viewModel)) {
                                    SavedLessonCard(
                                        lesson: lesson,
                                        isBookmarked: true,
                                        onBookmarkTap: {
                                            bookmarksManager.toggleBookmark(lesson.id)
                                        }
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, AppTheme.Spacing.xl)
                    }

                    Spacer(minLength: AppTheme.Spacing.xxxl)
                }
            }
            .background(
                colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
            )
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Saved Lesson Card
struct SavedLessonCard: View {
    let lesson: Lesson
    let isBookmarked: Bool
    let onBookmarkTap: () -> Void
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.small)
                    .fill(AppTheme.Colors.burntOrange.opacity(0.15))
                    .frame(width: 50, height: 50)

                Image(systemName: lesson.category.icon)
                    .font(.system(size: 22))
                    .foregroundColor(AppTheme.Colors.burntOrange)
            }

            // Content
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(lesson.problemHook ?? lesson.title)
                    .font(AppTheme.Typography.headline)
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .lineLimit(2)

                Text(lesson.category.description)
                    .font(AppTheme.Typography.caption)
                    .foregroundColor(AppTheme.Colors.secondaryText)

                if let duration = lesson.duration {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 10))
                        Text("\(duration) min")
                            .font(.system(size: 11))
                    }
                    .foregroundColor(AppTheme.Colors.warmGray)
                }
            }

            Spacer()

            // Bookmark Button
            Button(action: onBookmarkTap) {
                Image(systemName: isBookmarked ? "bookmark.fill" : "bookmark")
                    .font(.system(size: 20))
                    .foregroundColor(isBookmarked ? AppTheme.Colors.burntOrange : AppTheme.Colors.warmGray)
            }
        }
        .padding(AppTheme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                .fill(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                .stroke(AppTheme.Colors.warmGray.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Lesson Category Icon Extension
extension LessonCategory {
    var icon: String {
        switch self {
        case .leadership:
            return "crown.fill"
        case .integrity:
            return "checkmark.shield.fill"
        case .stewardship:
            return "dollarsign.circle.fill"
        case .trust:
            return "heart.fill"
        case .service:
            return "hand.raised.fill"
        case .perseverance:
            return "flame.fill"
        case .wisdom:
            return "lightbulb.fill"
        case .community:
            return "person.3.fill"
        case .timeManagement:
            return "clock.fill"
        case .decision:
            return "arrow.triangle.branch"
        }
    }
}
