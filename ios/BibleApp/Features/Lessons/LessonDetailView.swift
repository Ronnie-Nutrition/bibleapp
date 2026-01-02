import SwiftUI
import AVFoundation

// MARK: - Lesson Detail View
struct LessonDetailView: View {
    let lesson: Lesson
    @ObservedObject var viewModel: LessonsViewModel
    @StateObject private var bookmarksManager = BookmarksManager.shared
    @StateObject private var audioPlayer = LessonAudioPlayer()
    @Environment(\.presentationMode) var presentationMode
    @Environment(\.colorScheme) var colorScheme
    @State private var isCompleted = false

    var isBookmarked: Bool {
        bookmarksManager.isBookmarked(lesson.id)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xl) {
                // Header with Back Button
                HStack {
                    Button(action: { presentationMode.wrappedValue.dismiss() }) {
                        HStack(spacing: AppTheme.Spacing.xs) {
                            Image(systemName: "chevron.left")
                            Text("Back")
                        }
                        .font(AppTheme.Typography.callout)
                        .foregroundColor(AppTheme.Colors.royalGold)
                    }

                    Spacer()

                    // Audio Button
                    Button(action: {
                        if audioPlayer.isPlaying {
                            audioPlayer.stop()
                        } else {
                            audioPlayer.speak(lesson: lesson)
                        }
                    }) {
                        Image(systemName: audioPlayer.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(AppTheme.Colors.deepTeal)
                    }

                    // Bookmark Button
                    Button(action: {
                        bookmarksManager.toggleBookmark(lesson.id)
                    }) {
                        Image(systemName: isBookmarked ? "bookmark.fill" : "bookmark")
                            .font(.system(size: 22))
                            .foregroundColor(isBookmarked ? AppTheme.Colors.burntOrange : AppTheme.Colors.warmGray)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.md)

                // Lesson Image/Header
                if let imageURL = lesson.imageURL {
                    AsyncImage(url: URL(string: imageURL)) { phase in
                        switch phase {
                        case .empty:
                            lessonHeaderPlaceholder
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(height: 200)
                                .clipped()
                                .overlay(
                                    LinearGradient(
                                        colors: [.clear, AppTheme.Colors.deepIndigo.opacity(0.3)],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                        case .failure:
                            lessonHeaderPlaceholder
                        @unknown default:
                            lessonHeaderPlaceholder
                        }
                    }
                    .frame(height: 200)
                    .cornerRadius(AppTheme.CornerRadius.large)
                    .padding(.horizontal, AppTheme.Spacing.xl)
                } else {
                    lessonHeaderPlaceholder
                        .padding(.horizontal, AppTheme.Spacing.xl)
                }

                VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                    // Category and Metadata
                    HStack(spacing: AppTheme.Spacing.sm) {
                        Text(lesson.category.description)
                            .categoryBadge()

                        Text(lesson.difficulty.displayName)
                            .categoryBadge(color: AppTheme.Colors.amberGlow)

                        if let duration = lesson.duration {
                            HStack(spacing: 4) {
                                Image(systemName: "clock")
                                Text("\(duration) min")
                            }
                            .categoryBadge(color: AppTheme.Colors.successGreen)
                        }

                        Spacer()
                    }

                    // Title
                    Text(lesson.title)
                        .font(AppTheme.Typography.title)
                        .foregroundColor(AppTheme.Colors.primaryText)
                        .lineLimit(3)

                    // Subtitle
                    if let subtitle = lesson.subtitle {
                        Text(subtitle)
                            .font(AppTheme.Typography.subheadline)
                            .foregroundColor(AppTheme.Colors.secondaryText)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)

                // Main Content
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xl) {
                    // Key Takeaway
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        HStack(spacing: AppTheme.Spacing.sm) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(AppTheme.Colors.amberGlow)
                            Text("Key Takeaway")
                                .font(AppTheme.Typography.headline)
                                .foregroundColor(AppTheme.Colors.primaryText)
                        }

                        Text(lesson.keyTakeaway)
                            .font(AppTheme.Typography.body)
                            .foregroundColor(AppTheme.Colors.primaryText)
                            .lineSpacing(4)
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(AppTheme.Colors.amberGlow.opacity(0.1))
                    .cornerRadius(AppTheme.CornerRadius.medium)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                            .stroke(AppTheme.Colors.amberGlow.opacity(0.3), lineWidth: 1)
                    )

                    // Content
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        Text("Lesson")
                            .font(AppTheme.Typography.headline)
                            .foregroundColor(AppTheme.Colors.primaryText)

                        Text(lesson.content)
                            .font(AppTheme.Typography.body)
                            .lineSpacing(6)
                            .foregroundColor(AppTheme.Colors.primaryText)
                    }

                    // Bible Verses
                    if !lesson.bibleVerses.isEmpty {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                            Text("Scripture References")
                                .font(AppTheme.Typography.headline)
                                .foregroundColor(AppTheme.Colors.primaryText)

                            VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                                ForEach(lesson.bibleVerses) { verse in
                                    VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                                        Text(verse.reference)
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(AppTheme.Colors.royalGold)

                                        Text("\"\(verse.text)\"")
                                            .font(AppTheme.Typography.body)
                                            .italic()
                                            .foregroundColor(AppTheme.Colors.primaryText)
                                            .lineSpacing(4)
                                    }
                                    .premiumCard(padding: AppTheme.Spacing.md)
                                }
                            }
                        }
                    }

                    // Practical Steps
                    if !lesson.practicalSteps.isEmpty {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                            Text("Apply This Lesson")
                                .font(AppTheme.Typography.headline)
                                .foregroundColor(AppTheme.Colors.primaryText)

                            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                                ForEach(Array(lesson.practicalSteps.enumerated()), id: \.offset) { index, step in
                                    HStack(alignment: .top, spacing: AppTheme.Spacing.md) {
                                        ZStack {
                                            Circle()
                                                .fill(AppTheme.Gradients.primaryButton)
                                                .frame(width: 28, height: 28)

                                            Text("\(index + 1)")
                                                .font(.system(size: 14, weight: .bold))
                                                .foregroundColor(.white)
                                        }

                                        Text(step)
                                            .font(AppTheme.Typography.body)
                                            .lineSpacing(4)
                                            .foregroundColor(AppTheme.Colors.primaryText)

                                        Spacer()
                                    }
                                    .padding(.vertical, AppTheme.Spacing.xs)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)

                // Complete Button
                Button(action: {
                    isCompleted = true
                    Task {
                        await viewModel.completeLessonProgress(lessonId: lesson.id)
                    }
                }) {
                    HStack(spacing: AppTheme.Spacing.sm) {
                        Image(systemName: isCompleted ? "checkmark.circle.fill" : "checkmark")
                        Text(isCompleted ? "Lesson Completed" : "Mark as Complete")
                            .font(.system(size: 16, weight: .semibold))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppTheme.Spacing.md)
                .background(
                    Group {
                        if isCompleted {
                            AppTheme.Colors.successGreen
                        } else {
                            AppTheme.Gradients.primaryButton
                        }
                    }
                )
                .foregroundColor(.white)
                .cornerRadius(AppTheme.CornerRadius.medium)
                .shadow(
                    color: isCompleted ? AppTheme.Colors.successGreen.opacity(0.3) : AppTheme.Colors.royalGold.opacity(0.3),
                    radius: 8,
                    y: 4
                )
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.md)

                Spacer(minLength: AppTheme.Spacing.xxxl)
            }
        }
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
        )
        .navigationBarBackButtonHidden(true)
        .onAppear {
            isCompleted = viewModel.isLessonCompleted(lesson.id)
        }
        .onDisappear {
            audioPlayer.stop()
        }
    }

    // MARK: - Helper Views

    private var lessonHeaderPlaceholder: some View {
        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.large)
            .fill(
                LinearGradient(
                    colors: [AppTheme.Colors.softGold.opacity(0.3), AppTheme.Colors.royalGold.opacity(0.2)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(height: 200)
            .overlay(
                VStack(spacing: AppTheme.Spacing.sm) {
                    Image(systemName: "book.fill")
                        .font(.system(size: 48))
                        .foregroundColor(AppTheme.Colors.royalGold)

                    Text(lesson.category.description)
                        .font(AppTheme.Typography.caption)
                        .foregroundColor(AppTheme.Colors.royalGold)
                }
            )
    }
}

#Preview {
    let sampleLesson = Lesson(
        id: "1",
        title: "The Parable of the Talents",
        subtitle: "Faithful Management of Resources",
        content: "Jesus taught that we are stewards of what God has given us. In the Parable of the Talents, a master gives his servants money according to their abilities. Those who invest wisely and multiply what they've been given are commended, while the one who hides his talent is rebuked. This applies directly to entrepreneurship...",
        category: .stewardship,
        bibleVerses: [
            BibleVerse(id: UUID(), book: "Matthew", chapter: 25, verse: 14, endVerse: 30, text: "For it is just like a man about to go on a journey, who called his own slaves and entrusted his possessions to them.")
        ],
        practicalSteps: [
            "Identify your unique talents and resources",
            "Invest them wisely in business ventures",
            "Monitor your progress and results",
            "Share your success with others"
        ],
        keyTakeaway: "God expects us to be faithful stewards of the resources He gives us, investing them wisely and multiplying what we've been entrusted with.",
        createdAt: Date(),
        updatedAt: Date(),
        imageURL: nil,
        duration: 12,
        difficulty: .intermediate
    )

    NavigationView {
        LessonDetailView(lesson: sampleLesson, viewModel: LessonsViewModel())
    }
}
