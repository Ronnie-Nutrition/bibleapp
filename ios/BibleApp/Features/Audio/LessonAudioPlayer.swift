import Foundation
import AVFoundation
import SwiftUI

// MARK: - Lesson Audio Player
class LessonAudioPlayer: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published var isPlaying = false
    @Published var isPaused = false
    @Published var progress: Double = 0

    private let synthesizer = AVSpeechSynthesizer()
    private var currentUtterance: AVSpeechUtterance?
    private var totalCharacters = 0
    private var spokenCharacters = 0

    override init() {
        super.init()
        synthesizer.delegate = self
        setupAudioSession()
    }

    // MARK: - Audio Session Setup

    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.duckOthers])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
        }
    }

    // MARK: - Public Methods

    func speak(lesson: Lesson) {
        stop()

        // Build the text to speak
        var textToSpeak = ""

        // Add problem hook if available
        if let hook = lesson.problemHook {
            textToSpeak += "\(hook)\n\n"
        }

        // Add title
        textToSpeak += "\(lesson.title).\n\n"

        // Add key takeaway
        textToSpeak += "Key Takeaway: \(lesson.keyTakeaway)\n\n"

        // Add main content
        textToSpeak += "Lesson:\n\(lesson.content)\n\n"

        // Add Bible verses
        if !lesson.bibleVerses.isEmpty {
            textToSpeak += "Scripture References:\n"
            for verse in lesson.bibleVerses {
                textToSpeak += "\(verse.reference): \(verse.text)\n"
            }
            textToSpeak += "\n"
        }

        // Add practical steps
        if !lesson.practicalSteps.isEmpty {
            textToSpeak += "How to Apply This:\n"
            for (index, step) in lesson.practicalSteps.enumerated() {
                textToSpeak += "Step \(index + 1): \(step)\n"
            }
        }

        totalCharacters = textToSpeak.count
        spokenCharacters = 0

        let utterance = AVSpeechUtterance(string: textToSpeak)

        // Configure voice
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.9 // Slightly slower for clarity
        utterance.pitchMultiplier = 1.0
        utterance.volume = 1.0
        utterance.preUtteranceDelay = 0.3
        utterance.postUtteranceDelay = 0.3

        currentUtterance = utterance
        isPlaying = true
        synthesizer.speak(utterance)
    }

    func stop() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        isPlaying = false
        isPaused = false
        progress = 0
    }

    func pause() {
        if synthesizer.isSpeaking {
            synthesizer.pauseSpeaking(at: .immediate)
            isPaused = true
            isPlaying = false
        }
    }

    func resume() {
        if isPaused {
            synthesizer.continueSpeaking()
            isPaused = false
            isPlaying = true
        }
    }

    // MARK: - AVSpeechSynthesizerDelegate

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isPlaying = true
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isPlaying = false
            self.isPaused = false
            self.progress = 1.0
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isPlaying = false
            self.isPaused = false
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, willSpeakRangeOfSpeechString characterRange: NSRange, utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.spokenCharacters = characterRange.location + characterRange.length
            if self.totalCharacters > 0 {
                self.progress = Double(self.spokenCharacters) / Double(self.totalCharacters)
            }
        }
    }
}
