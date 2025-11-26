import SwiftUI

// MARK: - Login View
struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    @State private var showingSignUp = false
    @State private var showingForgotPassword = false

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Text("Biblical Lessons")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.primary)

                    Text("For Entrepreneurs")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.secondary)
                }
                .padding(.top, 40)

                Spacer()

                // Login Form
                VStack(spacing: 16) {
                    // Email Field
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Email")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)

                        TextField("user@example.com", text: $viewModel.email)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)

                        if viewModel.emailError != nil {
                            Text(viewModel.emailError ?? "")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }

                    // Password Field
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Password")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)

                        SecureField("Enter password", text: $viewModel.password)
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)

                        if viewModel.passwordError != nil {
                            Text(viewModel.passwordError ?? "")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }

                    // General Error Message
                    if let error = viewModel.errorMessage, viewModel.emailError == nil && viewModel.passwordError == nil {
                        VStack(spacing: 8) {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .foregroundColor(.red)
                                Text(error)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                Spacer()
                            }
                        }
                        .padding(8)
                        .background(Color(.systemRed).opacity(0.1))
                        .cornerRadius(6)
                    }
                }
                .padding(.horizontal, 20)

                // Sign In Button
                Button(action: {
                    Task {
                        await viewModel.signIn()
                    }
                }) {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Sign In")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
                .padding(.horizontal, 20)
                .disabled(viewModel.isLoading || !viewModel.isFormValid)

                // Forgot Password Link
                Button(action: { showingForgotPassword = true }) {
                    Text("Forgot Password?")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
                .padding(.horizontal, 20)

                // Sign Up Link
                HStack(spacing: 8) {
                    Text("Don't have an account?")
                        .foregroundColor(.secondary)

                    Button(action: { showingSignUp = true }) {
                        Text("Sign Up")
                            .fontWeight(.semibold)
                            .foregroundColor(.blue)
                    }
                }
                .padding(.top, 8)

                Spacer()
            }
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

    var body: some View {
        VStack(spacing: 24) {
            // Header
            HStack {
                Button(action: { presentationMode.wrappedValue.dismiss() }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .foregroundColor(.blue)
                }
                Spacer()
            }
            .padding(.horizontal, 20)

            // Title
            VStack(spacing: 8) {
                Text("Create Account")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.primary)

                Text("Join our community of faithful entrepreneurs")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)

            // Sign Up Form
            ScrollView {
                VStack(spacing: 16) {
                    // Display Name
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Full Name")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)

                        TextField("John Doe", text: $viewModel.displayName)
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)

                        if viewModel.displayNameError != nil {
                            Text(viewModel.displayNameError ?? "")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }

                    // Email
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Email")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)

                        TextField("user@example.com", text: $viewModel.email)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)

                        if viewModel.emailError != nil {
                            Text(viewModel.emailError ?? "")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }

                    // Password
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Password")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)

                        SecureField("Min 8 chars, mix of characters", text: $viewModel.password)
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)

                        if !viewModel.password.isEmpty {
                            PasswordStrengthIndicator(password: viewModel.password)
                        }

                        if viewModel.passwordError != nil {
                            Text(viewModel.passwordError ?? "")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }

                    // Confirm Password
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Confirm Password")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)

                        SecureField("Re-enter password", text: $viewModel.confirmPassword)
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)

                        if viewModel.confirmPasswordError != nil {
                            Text(viewModel.confirmPasswordError ?? "")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }

                    // General Error Message
                    if let error = viewModel.errorMessage {
                        VStack(spacing: 8) {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .foregroundColor(.red)
                                Text(error)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                Spacer()
                            }
                        }
                        .padding(8)
                        .background(Color(.systemRed).opacity(0.1))
                        .cornerRadius(6)
                    }
                }
                .padding(.horizontal, 20)
            }

            // Sign Up Button
            Button(action: {
                Task {
                    await viewModel.signUp()
                }
            }) {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Create Account")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(8)
            .padding(.horizontal, 20)
            .disabled(viewModel.isLoading || !viewModel.isFormValid)

            Spacer()
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
        case 0...2: return .red
        case 3: return .orange
        case 4: return .yellow
        case 5: return .green
        default: return .gray
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Strength bars
            HStack(spacing: 4) {
                ForEach(0..<5, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(index < strengthScore ? strengthColor : Color(.systemGray4))
                        .frame(height: 4)
                }
            }

            // Strength text
            HStack {
                Text("Strength: ")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(strengthText)
                    .font(.caption)
                    .fontWeight(.semibold)
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

    var body: some View {
        VStack(spacing: 24) {
            // Header
            HStack {
                Button(action: { presentationMode.wrappedValue.dismiss() }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .foregroundColor(.blue)
                }
                Spacer()
            }
            .padding(.horizontal, 20)

            // Title
            VStack(spacing: 8) {
                Text("Reset Password")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.primary)

                Text("Enter your email to receive password reset instructions")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)

            Spacer()

            // Email Form
            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Email")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)

                    TextField("user@example.com", text: $viewModel.email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .padding(12)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)

                    if viewModel.emailError != nil {
                        Text(viewModel.emailError ?? "")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }

                if let error = viewModel.errorMessage {
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundColor(.red)
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                    .padding(8)
                    .background(Color(.systemRed).opacity(0.1))
                    .cornerRadius(6)
                }

                if viewModel.successMessage != nil {
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text(viewModel.successMessage ?? "")
                                .font(.caption)
                                .foregroundColor(.green)
                            Spacer()
                        }
                    }
                    .padding(8)
                    .background(Color(.systemGreen).opacity(0.1))
                    .cornerRadius(6)
                }
            }
            .padding(.horizontal, 20)

            // Send Button
            Button(action: {
                Task {
                    await viewModel.sendResetEmail()
                }
            }) {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Send Reset Link")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(8)
            .padding(.horizontal, 20)
            .disabled(viewModel.isLoading || viewModel.email.isEmpty)

            Spacer()
        }
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

#Preview {
    LoginView()
}
