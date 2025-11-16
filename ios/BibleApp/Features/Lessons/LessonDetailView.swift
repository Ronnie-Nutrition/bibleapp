import SwiftUI

// MARK: - Lesson Detail View
struct LessonDetailView: View {
    let lesson: Lesson
    @ObservedObject var viewModel: LessonsViewModel
    @Environment(\.dismiss) var dismiss
    @State private var isCompleted = false
    @State private var isFavorite = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header with Back Button
                HStack {
                    Button(action: { dismiss() }) {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left")
                            Text("Back")
                        }
                        .foregroundColor(.blue)
                    }

                    Spacer()

                    // Favorite Button
                    Button(action: {
                        isFavorite.toggle()
                        Task {
                            await viewModel.toggleFavorite(lessonId: lesson.id)
                        }
                    }) {
                        Image(systemName: isFavorite ? "heart.fill" : "heart")
                            .foregroundColor(isFavorite ? .red : .gray)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)

                // Lesson Image/Header
                if let imageURL = lesson.imageURL {
                    AsyncImage(url: URL(string: imageURL)) { phase in
                        switch phase {
                        case .empty:
                            Color(.systemGray6)
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                        case .failure:
                            Color(.systemGray6)
                        @unknown default:
                            Color(.systemGray6)
                        }
                    }
                    .frame(height: 200)
                    .clipped()
                } else {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.blue.opacity(0.1))
                        .frame(height: 200)
                        .overlay(
                            VStack {
                                Image(systemName: "book")
                                    .font(.system(size: 48))
                                    .foregroundColor(.blue)
                            }
                        )
                        .padding(.horizontal, 20)
                }

                VStack(alignment: .leading, spacing: 12) {
                    // Category and Metadata
                    HStack(spacing: 12) {
                        Text(lesson.category.description)
                            .font(.caption)
                            .padding(6)
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(4)

                        Text(lesson.difficulty.displayName)
                            .font(.caption)
                            .padding(6)
                            .background(Color.orange.opacity(0.1))
                            .foregroundColor(.orange)
                            .cornerRadius(4)

                        if let duration = lesson.duration {
                            HStack(spacing: 4) {
                                Image(systemName: "clock")
                                Text("\(duration) min")
                            }
                            .font(.caption)
                            .padding(6)
                            .background(Color.green.opacity(0.1))
                            .foregroundColor(.green)
                            .cornerRadius(4)
                        }

                        Spacer()
                    }

                    // Title
                    Text(lesson.title)
                        .font(.system(size: 24, weight: .bold))
                        .lineLimit(3)

                    // Subtitle
                    if let subtitle = lesson.subtitle {
                        Text(subtitle)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal, 20)

                // Main Content
                VStack(alignment: .leading, spacing: 16) {
                    // Key Takeaway
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(.yellow)
                            Text("Key Takeaway")
                                .font(.headline)
                        }

                        Text(lesson.keyTakeaway)
                            .font(.body)
                            .foregroundColor(.primary)
                    }
                    .padding(16)
                    .background(Color.yellow.opacity(0.1))
                    .cornerRadius(8)

                    // Content
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Lesson")
                            .font(.headline)

                        Text(lesson.content)
                            .font(.body)
                            .lineSpacing(6)
                            .foregroundColor(.primary)
                    }

                    // Bible Verses
                    if !lesson.bibleVerses.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Scripture References")
                                .font(.headline)

                            VStack(alignment: .leading, spacing: 12) {
                                ForEach(lesson.bibleVerses) { verse in
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(verse.reference)
                                            .font(.caption)
                                            .fontWeight(.semibold)
                                            .foregroundColor(.blue)

                                        Text("\"\(verse.text)\"")
                                            .font(.body)
                                            .italic()
                                            .foregroundColor(.primary)
                                    }
                                    .padding(12)
                                    .background(Color(.systemGray6))
                                    .cornerRadius(8)
                                }
                            }
                        }
                    }

                    // Practical Steps
                    if !lesson.practicalSteps.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Apply This Lesson")
                                .font(.headline)

                            VStack(alignment: .leading, spacing: 8) {
                                ForEach(Array(lesson.practicalSteps.enumerated()), id: \.offset) { index, step in
                                    HStack(alignment: .top, spacing: 12) {
                                        ZStack {
                                            Circle()
                                                .fill(Color.green)
                                                .frame(width: 24, height: 24)

                                            Text("\(index + 1)")
                                                .font(.caption)
                                                .fontWeight(.semibold)
                                                .foregroundColor(.white)
                                        }

                                        Text(step)
                                            .font(.body)
                                            .lineSpacing(4)
                                            .foregroundColor(.primary)

                                        Spacer()
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)

                // Complete Button
                Button(action: {
                    isCompleted = true
                    Task {
                        await viewModel.completeLessonProgress(lessonId: lesson.id)
                    }
                }) {
                    HStack {
                        Image(systemName: "checkmark")
                        Text(isCompleted ? "Lesson Completed ✓" : "Mark as Complete")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(12)
                    .background(isCompleted ? Color.green : Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)

                Spacer(minLength: 40)
            }
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            isCompleted = viewModel.isLessonCompleted(lesson.id)
            isFavorite = viewModel.isLessonFavorite(lesson.id)
        }
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

    NavigationStack {
        LessonDetailView(lesson: sampleLesson, viewModel: LessonsViewModel())
    }
}
