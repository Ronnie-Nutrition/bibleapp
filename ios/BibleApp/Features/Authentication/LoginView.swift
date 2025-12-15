import SwiftUI

// MARK: - Login View
struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    @State private var showingSignUp = false
    @State private var showingForgotPassword = false
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.xxl) {
                    // Header
                    VStack(spacing: AppTheme.Spacing.sm) {
                        // App Icon/Logo area
                        ZStack {
                            Circle()
                                .fill(AppTheme.Gradients.goldShimmer)
                                .frame(width: 80, height: 80)

                            Image(systemName: "book.fill")
                                .font(.system(size: 36))
                                .foregroundColor(.white)
                        }
                        .shadow(color: AppTheme.Colors.royalGold.opacity(0.3), radius: 12, y: 4)
                        .padding(.bottom, AppTheme.Spacing.sm)

                        Text("Biblical Lessons")
                            .font(AppTheme.Typography.largeTitle)
                            .foregroundColor(AppTheme.Colors.primaryText)

                        Text("For Entrepreneurs")
                            .font(AppTheme.Typography.headline)
                            .foregroundColor(AppTheme.Colors.royalGold)
                    }
                    .padding(.top, AppTheme.Spacing.xxxl)

                    // Login Form
                    VStack(spacing: AppTheme.Spacing.lg) {
                        // Email Field
                        PremiumTextField(
                            label: "Email",
                            placeholder: "you@example.com",
                            text: $viewModel.email,
                            errorMessage: viewModel.emailError,
                            keyboardType: .emailAddress
                        )

                        // Password Field
                        PremiumSecureField(
                            label: "Password",
                            placeholder: "Enter your password",
                            text: $viewModel.password,
                            errorMessage: viewModel.passwordError
                        )

                        // General Error Message
                        if let error = viewModel.errorMessage, viewModel.emailError == nil && viewModel.passwordError == nil {
                            ErrorMessageView(message: error)
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.xl)

                    // Sign In Button
                    GradientButton(
                        title: "Sign In",
                        icon: "arrow.right",
                        isLoading: viewModel.isLoading,
                        isDisabled: !viewModel.isFormValid
                    ) {
                        Task {
                            await viewModel.signIn()
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.xl)

                    // Forgot Password Link
                    Button(action: { showingForgotPassword = true }) {
                        Text("Forgot Password?")
                            .font(AppTheme.Typography.callout)
                            .foregroundColor(AppTheme.Colors.royalGold)
                    }

                    // Sign Up Link
                    HStack(spacing: AppTheme.Spacing.sm) {
                        Text("Don't have an account?")
                            .font(AppTheme.Typography.body)
                            .foregroundColor(AppTheme.Colors.secondaryText)

                        Button(action: { showingSignUp = true }) {
                            Text("Sign Up")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(AppTheme.Colors.royalGold)
                        }
                    }
                    .padding(.top, AppTheme.Spacing.sm)

                    Spacer(minLength: AppTheme.Spacing.xxxl)
                }
            }
            .background(
                colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
            )
            .sheet(isPresented: $showingSignUp) {
                NavigationView {
                    SignUpView()
                }
            }
            .sheet(isPresented: $showingForgotPassword) {
                NavigationView {
                    ForgotPasswordView()
                }
            }
        }
    }
}

// MARK: - Login View Model
@MainActor
class LoginViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var emailError: String?
    @Published var passwordError: String?

    private let authManager = AuthenticationManager.shared

    var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && emailError == nil
    }

    private func validateEmail() {
        if email.isEmpty {
            emailError = nil
            return
        }

        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)

        if !emailPredicate.evaluate(with: email) {
            emailError = "Please enter a valid email address"
        } else {
            emailError = nil
        }
    }

    func signIn() async {
        isLoading = true
        errorMessage = nil

        // Validate email
        validateEmail()

        // Validate inputs
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please fill in all fields"
            isLoading = false
            return
        }

        guard emailError == nil else {
            isLoading = false
            return
        }

        // Use Firebase authentication directly
        await authManager.signIn(email: email, password: password)

        if let error = authManager.errorMessage {
            errorMessage = error
        }
        isLoading = false
    }
}

// MARK: - Sign Up View
struct SignUpView: View {
    @StateObject private var viewModel = SignUpViewModel()
    @Environment(\.presentationMode) var presentationMode
    @ObservedObject private var authManager = AuthenticationManager.shared
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.Spacing.xxl) {
                // Header
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
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.md)

                // Title
                VStack(spacing: AppTheme.Spacing.sm) {
                    Text("Create Account")
                        .font(AppTheme.Typography.title)
                        .foregroundColor(AppTheme.Colors.primaryText)

                    Text("Join our community of faithful entrepreneurs")
                        .font(AppTheme.Typography.callout)
                        .foregroundColor(AppTheme.Colors.secondaryText)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, AppTheme.Spacing.xl)

                // Sign Up Form
                VStack(spacing: AppTheme.Spacing.lg) {
                    // Display Name
                    PremiumTextField(
                        label: "Full Name",
                        placeholder: "John Doe",
                        text: $viewModel.displayName,
                        errorMessage: viewModel.displayNameError
                    )

                    // Email
                    PremiumTextField(
                        label: "Email",
                        placeholder: "you@example.com",
                        text: $viewModel.email,
                        errorMessage: viewModel.emailError,
                        keyboardType: .emailAddress
                    )

                    // Password
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                        PremiumSecureField(
                            label: "Password",
                            placeholder: "Min 6 characters",
                            text: $viewModel.password,
                            errorMessage: viewModel.passwordError
                        )

                        if !viewModel.password.isEmpty {
                            PasswordStrengthIndicator(password: viewModel.password)
                                .padding(.top, AppTheme.Spacing.xs)
                        }
                    }

                    // Confirm Password
                    PremiumSecureField(
                        label: "Confirm Password",
                        placeholder: "Re-enter password",
                        text: $viewModel.confirmPassword,
                        errorMessage: viewModel.confirmPasswordError
                    )

                    // General Error Message
                    if let error = viewModel.errorMessage {
                        ErrorMessageView(message: error)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)

                // Sign Up Button
                GradientButton(
                    title: "Create Account",
                    icon: "person.badge.plus",
                    isLoading: viewModel.isLoading,
                    isDisabled: !viewModel.isFormValid
                ) {
                    Task {
                        await viewModel.signUp()
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)

                Spacer(minLength: AppTheme.Spacing.xxxl)
            }
        }
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
        )
        .onChange(of: authManager.isAuthenticated) { isAuthenticated in
            if isAuthenticated {
                presentationMode.wrappedValue.dismiss()
            }
        }
    }
}

// MARK: - Sign Up View Model
@MainActor
class SignUpViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var displayName = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var displayNameError: String?
    @Published var emailError: String?
    @Published var passwordError: String?
    @Published var confirmPasswordError: String?

    private let authManager = AuthenticationManager.shared

    var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && !displayName.isEmpty &&
        displayNameError == nil && emailError == nil && passwordError == nil && confirmPasswordError == nil
    }

    private func validateEmail() {
        if email.isEmpty {
            emailError = nil
            return
        }

        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)

        if !emailPredicate.evaluate(with: email) {
            emailError = "Please enter a valid email address"
        } else {
            emailError = nil
        }
    }

    private func validatePassword() {
        if password.isEmpty {
            passwordError = nil
            return
        }

        // Firebase requires minimum 6 characters
        if password.count < 6 {
            passwordError = "Password must be at least 6 characters"
        } else {
            passwordError = nil
        }
    }

    private func validateDisplayName() {
        let trimmed = displayName.trimmingCharacters(in: .whitespaces)

        if trimmed.isEmpty {
            displayNameError = nil
            return
        }

        if trimmed.count < 2 {
            displayNameError = "Name must be at least 2 characters"
            return
        }

        if trimmed.count > 50 {
            displayNameError = "Name must not exceed 50 characters"
            return
        }

        displayNameError = nil
    }

    private func validateConfirmPassword() {
        if confirmPassword.isEmpty {
            confirmPasswordError = nil
            return
        }

        if password != confirmPassword {
            confirmPasswordError = "Passwords do not match"
        } else {
            confirmPasswordError = nil
        }
    }

    func signUp() async {
        isLoading = true
        errorMessage = nil

        // Validate all fields
        validateEmail()
        validatePassword()
        validateDisplayName()
        validateConfirmPassword()

        // Check if form is valid
        guard isFormValid else {
            isLoading = false
            if displayNameError == nil && emailError == nil && passwordError == nil && confirmPasswordError == nil {
                errorMessage = "Please fill in all fields"
            }
            return
        }

        // Use Firebase authentication directly
        await authManager.signUp(email: email, password: password, displayName: displayName)

        if let error = authManager.errorMessage {
            errorMessage = error
        }
        isLoading = false
    }
}

// MARK: - Password Strength Indicator
struct PasswordStrengthIndicator: View {
    let password: String

    private var strengthScore: Int {
        var score = 0

        if password.count >= 8 { score += 1 }
        if password.contains(where: { $0.isUppercase }) { score += 1 }
        if password.contains(where: { $0.isLowercase }) { score += 1 }
        if password.contains(where: { $0.isNumber }) { score += 1 }
        if password.contains(where: { "!@#$%^&*()_+-=[]{};\':\"\\|,.<>/?".contains($0) }) { score += 1 }

        return score
    }

    private var strengthText: String {
        switch strengthScore {
        case 0...2: return "Weak"
        case 3: return "Fair"
        case 4: return "Good"
        case 5: return "Strong"
        default: return "Unknown"
        }
    }

    private var strengthColor: Color {
        switch strengthScore {
        case 0...2: return AppTheme.Colors.richBurgundy
        case 3: return AppTheme.Colors.amberGlow
        case 4: return AppTheme.Colors.royalGold
        case 5: return AppTheme.Colors.successGreen
        default: return AppTheme.Colors.warmGray
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            // Strength bars
            HStack(spacing: AppTheme.Spacing.xs) {
                ForEach(0..<5, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(index < strengthScore ? strengthColor : AppTheme.Colors.warmGray.opacity(0.3))
                        .frame(height: 4)
                }
            }

            // Strength text
            HStack {
                Text("Strength:")
                    .font(AppTheme.Typography.smallCaption)
                    .foregroundColor(AppTheme.Colors.secondaryText)

                Text(strengthText)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(strengthColor)

                Spacer()
            }
        }
    }
}

// MARK: - Forgot Password View
struct ForgotPasswordView: View {
    @StateObject private var viewModel = ForgotPasswordViewModel()
    @Environment(\.presentationMode) var presentationMode
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.Spacing.xxl) {
                // Header
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
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.md)

                // Icon
                ZStack {
                    Circle()
                        .fill(AppTheme.Colors.softGold.opacity(0.3))
                        .frame(width: 80, height: 80)

                    Image(systemName: "key.fill")
                        .font(.system(size: 32))
                        .foregroundColor(AppTheme.Colors.royalGold)
                }

                // Title
                VStack(spacing: AppTheme.Spacing.sm) {
                    Text("Reset Password")
                        .font(AppTheme.Typography.title)
                        .foregroundColor(AppTheme.Colors.primaryText)

                    Text("Enter your email to receive password reset instructions")
                        .font(AppTheme.Typography.callout)
                        .foregroundColor(AppTheme.Colors.secondaryText)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, AppTheme.Spacing.xl)

                // Email Form
                VStack(spacing: AppTheme.Spacing.lg) {
                    PremiumTextField(
                        label: "Email",
                        placeholder: "you@example.com",
                        text: $viewModel.email,
                        errorMessage: viewModel.emailError,
                        keyboardType: .emailAddress
                    )

                    if let error = viewModel.errorMessage {
                        ErrorMessageView(message: error)
                    }

                    if let success = viewModel.successMessage {
                        SuccessMessageView(message: success)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)

                // Send Button
                GradientButton(
                    title: "Send Reset Link",
                    icon: "paperplane.fill",
                    isLoading: viewModel.isLoading,
                    isDisabled: viewModel.email.isEmpty
                ) {
                    Task {
                        await viewModel.sendResetEmail()
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)

                Spacer(minLength: AppTheme.Spacing.xxxl)
            }
        }
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
        )
    }
}

// MARK: - Forgot Password View Model
@MainActor
class ForgotPasswordViewModel: ObservableObject {
    @Published var email = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    @Published var emailError: String?

    private let firebaseService = FirebaseService.shared

    private func validateEmail() {
        if email.isEmpty {
            emailError = nil
            return
        }

        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)

        if !emailPredicate.evaluate(with: email) {
            emailError = "Please enter a valid email address"
        } else {
            emailError = nil
        }
    }

    func sendResetEmail() async {
        isLoading = true
        errorMessage = nil
        successMessage = nil

        validateEmail()

        guard emailError == nil else {
            isLoading = false
            return
        }

        do {
            // Use Firebase password reset directly
            try await firebaseService.sendPasswordReset(email: email)
            successMessage = "Reset link sent to \(email). Check your email for instructions."
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = "Failed to send reset email: \(error.localizedDescription)"
        }
    }
}

// MARK: - Premium Form Components

struct PremiumTextField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var errorMessage: String?
    var keyboardType: UIKeyboardType = .default
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text(label)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(AppTheme.Colors.secondaryText)
                .textCase(.uppercase)

            TextField(placeholder, text: $text)
                .textInputAutocapitalization(.never)
                .keyboardType(keyboardType)
                .font(AppTheme.Typography.body)
                .premiumInput()

            if let error = errorMessage {
                Text(error)
                    .font(AppTheme.Typography.smallCaption)
                    .foregroundColor(AppTheme.Colors.richBurgundy)
            }
        }
    }
}

struct PremiumSecureField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var errorMessage: String?
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text(label)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(AppTheme.Colors.secondaryText)
                .textCase(.uppercase)

            SecureField(placeholder, text: $text)
                .font(AppTheme.Typography.body)
                .premiumInput()

            if let error = errorMessage {
                Text(error)
                    .font(AppTheme.Typography.smallCaption)
                    .foregroundColor(AppTheme.Colors.richBurgundy)
            }
        }
    }
}

struct ErrorMessageView: View {
    let message: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundColor(AppTheme.Colors.richBurgundy)
            Text(message)
                .font(AppTheme.Typography.caption)
                .foregroundColor(AppTheme.Colors.richBurgundy)
            Spacer()
        }
        .padding(AppTheme.Spacing.md)
        .background(AppTheme.Colors.richBurgundy.opacity(0.1))
        .cornerRadius(AppTheme.CornerRadius.small)
    }
}

struct SuccessMessageView: View {
    let message: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(AppTheme.Colors.successGreen)
            Text(message)
                .font(AppTheme.Typography.caption)
                .foregroundColor(AppTheme.Colors.successGreen)
            Spacer()
        }
        .padding(AppTheme.Spacing.md)
        .background(AppTheme.Colors.successGreen.opacity(0.1))
        .cornerRadius(AppTheme.CornerRadius.small)
    }
}

#Preview {
    LoginView()
}
