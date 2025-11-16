import SwiftUI

// MARK: - Login View
struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    @State private var showingSignUp = false

    var body: some View {
        NavigationStack {
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
                    TextField("Email", text: $viewModel.email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .padding(12)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)

                    SecureField("Password", text: $viewModel.password)
                        .padding(12)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)

                    // Error Message
                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
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
                .disabled(viewModel.isLoading)

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
            .navigationDestination(isPresented: $showingSignUp) {
                SignUpView()
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

    private let authManager = AuthenticationManager.shared

    func signIn() async {
        isLoading = true
        errorMessage = nil

        // Validate inputs
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please fill in all fields"
            isLoading = false
            return
        }

        await authManager.signIn(email: email, password: password)
        isLoading = false
        errorMessage = authManager.errorMessage
    }
}

// MARK: - Sign Up View
struct SignUpView: View {
    @StateObject private var viewModel = SignUpViewModel()
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack(spacing: 24) {
            // Header
            HStack {
                Button(action: { dismiss() }) {
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
            VStack(spacing: 16) {
                TextField("Full Name", text: $viewModel.displayName)
                    .padding(12)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)

                TextField("Email", text: $viewModel.email)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .padding(12)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)

                SecureField("Password", text: $viewModel.password)
                    .padding(12)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)

                SecureField("Confirm Password", text: $viewModel.confirmPassword)
                    .padding(12)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)

                // Error Message
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(.horizontal, 20)

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
            .disabled(viewModel.isLoading)

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

    private let authManager = AuthenticationManager.shared

    func signUp() async {
        isLoading = true
        errorMessage = nil

        // Validate inputs
        guard !email.isEmpty, !password.isEmpty, !displayName.isEmpty else {
            errorMessage = "Please fill in all fields"
            isLoading = false
            return
        }

        guard password == confirmPassword else {
            errorMessage = "Passwords do not match"
            isLoading = false
            return
        }

        guard password.count >= 6 else {
            errorMessage = "Password must be at least 6 characters"
            isLoading = false
            return
        }

        await authManager.signUp(email: email, password: password, displayName: displayName)
        isLoading = false
        errorMessage = authManager.errorMessage
    }
}

#Preview {
    LoginView()
}
