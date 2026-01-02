import SwiftUI

// MARK: - Learning Paths List View
struct LearningPathsView: View {
    @ObservedObject var viewModel: LessonsViewModel
    @StateObject private var progressManager = LearningPathProgressManager.shared
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                // Header
                VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                    Text("Learning Paths")
                        .font(AppTheme.Typography.largeTitle)
                        .foregroundColor(AppTheme.Colors.primaryText)

                    Text("Structured journeys to transform your business")
                        .font(AppTheme.Typography.callout)
                        .foregroundColor(AppTheme.Colors.secondaryText)
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.lg)

                // Active Path (if any)
                if let activeId = progressManager.activePathId,
                   let activePath = LearningPathsData.allPaths.first(where: { $0.id == activeId }) {
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        Text("CONTINUE YOUR JOURNEY")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(AppTheme.Colors.secondaryText)
                            .tracking(1)

                        NavigationLink(destination: LearningPathDetailView(path: activePath, viewModel: viewModel)) {
                            ActivePathCard(path: activePath, progress: progressManager.getProgress(for: activePath))
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.xl)
                }

                // All Paths
                VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                    Text("ALL JOURNEYS")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(AppTheme.Colors.secondaryText)
                        .tracking(1)
                        .padding(.horizontal, AppTheme.Spacing.xl)

                    LazyVStack(spacing: AppTheme.Spacing.md) {
                        ForEach(LearningPathsData.allPaths) { path in
                            NavigationLink(destination: LearningPathDetailView(path: path, viewModel: viewModel)) {
                                LearningPathCard(
                                    path: path,
                                    progress: progressManager.getProgress(for: path),
                                    isActive: progressManager.activePathId == path.id
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
        .navigationTitle("Learning Paths")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Active Path Card
struct ActivePathCard: View {
    let path: LearningPath
    let progress: Double
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            HStack {
                Image(systemName: path.icon)
                    .font(.system(size: 24))
                    .foregroundColor(.white)

                VStack(alignment: .leading, spacing: 2) {
                    Text(path.title)
                        .font(AppTheme.Typography.headline)
                        .foregroundColor(.white)

                    Text("\(Int(progress * 100))% complete")
                        .font(AppTheme.Typography.caption)
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.white.opacity(0.7))
            }

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white.opacity(0.3))
                        .frame(height: 8)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white)
                        .frame(width: geometry.size.width * progress, height: 8)
                }
            }
            .frame(height: 8)
        }
        .padding(AppTheme.Spacing.lg)
        .background(
            LinearGradient(
                colors: [path.color, path.color.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(AppTheme.CornerRadius.large)
    }
}

// MARK: - Learning Path Card
struct LearningPathCard: View {
    let path: LearningPath
    let progress: Double
    let isActive: Bool
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            // Icon
            ZStack {
                Circle()
                    .fill(path.color.opacity(0.15))
                    .frame(width: 56, height: 56)

                Image(systemName: path.icon)
                    .font(.system(size: 24))
                    .foregroundColor(path.color)
            }

            // Content
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                HStack {
                    Text(path.title)
                        .font(AppTheme.Typography.headline)
                        .foregroundColor(AppTheme.Colors.primaryText)

                    if isActive {
                        Text("ACTIVE")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(path.color)
                            .cornerRadius(4)
                    }
                }

                Text(path.subtitle)
                    .font(AppTheme.Typography.caption)
                    .foregroundColor(path.color)

                Text(path.description)
                    .font(AppTheme.Typography.caption)
                    .foregroundColor(AppTheme.Colors.secondaryText)
                    .lineLimit(2)

                if progress > 0 {
                    HStack(spacing: AppTheme.Spacing.sm) {
                        ProgressView(value: progress)
                            .tint(path.color)

                        Text("\(Int(progress * 100))%")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(AppTheme.Colors.secondaryText)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(AppTheme.Colors.warmGray)
        }
        .padding(AppTheme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                .fill(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                .stroke(isActive ? path.color : AppTheme.Colors.warmGray.opacity(0.2), lineWidth: isActive ? 2 : 1)
        )
    }
}

// MARK: - Learning Path Detail View
struct LearningPathDetailView: View {
    let path: LearningPath
    @ObservedObject var viewModel: LessonsViewModel
    @StateObject private var progressManager = LearningPathProgressManager.shared
    @Environment(\.colorScheme) var colorScheme

    var pathLessons: [Lesson] {
        path.lessonIds.compactMap { id in
            viewModel.lessons.first { $0.id == id }
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                // Header
                VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                    HStack {
                        Image(systemName: path.icon)
                            .font(.system(size: 32))
                            .foregroundColor(path.color)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(path.title)
                                .font(AppTheme.Typography.title)
                                .foregroundColor(AppTheme.Colors.primaryText)

                            Text(path.subtitle)
                                .font(AppTheme.Typography.callout)
                                .foregroundColor(path.color)
                        }
                    }

                    Text(path.description)
                        .font(AppTheme.Typography.body)
                        .foregroundColor(AppTheme.Colors.secondaryText)

                    // Progress
                    let progress = progressManager.getProgress(for: path)
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                        HStack {
                            Text("\(Int(progress * 100))% Complete")
                                .font(AppTheme.Typography.caption)
                                .foregroundColor(AppTheme.Colors.secondaryText)

                            Spacer()

                            Text("\(pathLessons.count) lessons")
                                .font(AppTheme.Typography.caption)
                                .foregroundColor(AppTheme.Colors.secondaryText)
                        }

                        ProgressView(value: progress)
                            .tint(path.color)
                    }

                    // Start/Continue Button
                    if progressManager.activePathId != path.id {
                        Button(action: {
                            progressManager.startPath(path.id)
                        }) {
                            Text("Start Journey")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, AppTheme.Spacing.md)
                                .background(path.color)
                                .cornerRadius(AppTheme.CornerRadius.medium)
                        }
                    }
                }
                .padding(AppTheme.Spacing.xl)
                .background(
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.large)
                        .fill(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground)
                )
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.lg)

                // Lessons
                VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                    Text("LESSONS IN THIS PATH")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(AppTheme.Colors.secondaryText)
                        .tracking(1)
                        .padding(.horizontal, AppTheme.Spacing.xl)

                    LazyVStack(spacing: AppTheme.Spacing.sm) {
                        ForEach(Array(pathLessons.enumerated()), id: \.element.id) { index, lesson in
                            NavigationLink(destination: LessonDetailView(lesson: lesson, viewModel: viewModel)) {
                                PathLessonRow(
                                    lesson: lesson,
                                    dayNumber: index + 1,
                                    isCompleted: progressManager.isLessonCompleted(in: path.id, lessonId: lesson.id),
                                    color: path.color
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
        .navigationTitle(path.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Path Lesson Row
struct PathLessonRow: View {
    let lesson: Lesson
    let dayNumber: Int
    let isCompleted: Bool
    let color: Color
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            // Day indicator
            ZStack {
                Circle()
                    .fill(isCompleted ? color : color.opacity(0.2))
                    .frame(width: 40, height: 40)

                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                } else {
                    Text("\(dayNumber)")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(color)
                }
            }

            // Content
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("Day \(dayNumber)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(color)

                Text(lesson.problemHook ?? lesson.title)
                    .font(AppTheme.Typography.headline)
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .lineLimit(2)

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

            Image(systemName: "chevron.right")
                .foregroundColor(AppTheme.Colors.warmGray)
        }
        .padding(AppTheme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                .fill(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                .stroke(isCompleted ? color.opacity(0.5) : AppTheme.Colors.warmGray.opacity(0.2), lineWidth: 1)
        )
    }
}
