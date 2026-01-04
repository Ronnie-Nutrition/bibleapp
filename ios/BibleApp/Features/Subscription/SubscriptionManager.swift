import Foundation
import StoreKit

// MARK: - Subscription Product Identifiers
enum SubscriptionProduct: String, CaseIterable {
    case monthlyPremium = "com.bibleapp.biblical.premium.monthly"

    var displayName: String {
        switch self {
        case .monthlyPremium:
            return "Premium Monthly"
        }
    }
}

// MARK: - Subscription Status
enum SubscriptionStatus: Equatable {
    case notSubscribed
    case subscribed(expirationDate: Date)
    case expired
    case pending

    var isPremium: Bool {
        if case .subscribed = self { return true }
        return false
    }
}

// MARK: - Subscription Manager
@MainActor
class SubscriptionManager: ObservableObject {
    static let shared = SubscriptionManager()

    // MARK: - Published Properties
    @Published private(set) var subscriptionStatus: SubscriptionStatus = .notSubscribed
    @Published private(set) var products: [Product] = []
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?
    @Published private(set) var purchaseInProgress = false

    // MARK: - Computed Properties
    var isPremium: Bool {
        subscriptionStatus.isPremium
    }

    var monthlyProduct: Product? {
        products.first { $0.id == SubscriptionProduct.monthlyPremium.rawValue }
    }

    // MARK: - Private Properties
    private var updateListenerTask: Task<Void, Error>?
    private let userDefaultsKey = "cachedSubscriptionStatus"
    private let expirationKey = "cachedSubscriptionExpiration"

    // MARK: - Initialization
    private init() {
        loadCachedStatus()
        updateListenerTask = listenForTransactions()

        Task {
            await loadProducts()
            await updateSubscriptionStatus()
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    // MARK: - Product Loading
    func loadProducts() async {
        isLoading = true
        errorMessage = nil

        do {
            let productIds = SubscriptionProduct.allCases.map { $0.rawValue }
            products = try await Product.products(for: Set(productIds))
            isLoading = false
        } catch {
            errorMessage = "Failed to load products: \(error.localizedDescription)"
            isLoading = false
        }
    }

    // MARK: - Purchase
    func purchase(_ product: Product) async throws {
        purchaseInProgress = true
        defer { purchaseInProgress = false }

        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await updateSubscriptionStatus()
            await transaction.finish()

        case .userCancelled:
            break

        case .pending:
            subscriptionStatus = .pending

        @unknown default:
            break
        }
    }

    // MARK: - Restore Purchases
    func restorePurchases() async {
        isLoading = true
        errorMessage = nil

        do {
            try await AppStore.sync()
            await updateSubscriptionStatus()
        } catch {
            errorMessage = "Failed to restore: \(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Status Updates
    func updateSubscriptionStatus() async {
        var foundActiveSubscription = false

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }

            if transaction.productID == SubscriptionProduct.monthlyPremium.rawValue {
                if let expirationDate = transaction.expirationDate,
                   expirationDate > Date() {
                    subscriptionStatus = .subscribed(expirationDate: expirationDate)
                    foundActiveSubscription = true
                    cacheStatus(true, expirationDate: expirationDate)
                }
            }
        }

        if !foundActiveSubscription {
            subscriptionStatus = .notSubscribed
            cacheStatus(false, expirationDate: nil)
        }
    }

    // MARK: - Transaction Listener
    private func listenForTransactions() -> Task<Void, Error> {
        Task.detached {
            for await result in Transaction.updates {
                guard case .verified(let transaction) = result else { continue }
                await self.updateSubscriptionStatus()
                await transaction.finish()
            }
        }
    }

    // MARK: - Verification
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let safe):
            return safe
        }
    }

    // MARK: - Caching
    private func loadCachedStatus() {
        let isPremiumCached = UserDefaults.standard.bool(forKey: userDefaultsKey)
        if isPremiumCached {
            if let expDate = UserDefaults.standard.object(forKey: expirationKey) as? Date,
               expDate > Date() {
                subscriptionStatus = .subscribed(expirationDate: expDate)
            }
        }
    }

    private func cacheStatus(_ isPremium: Bool, expirationDate: Date?) {
        UserDefaults.standard.set(isPremium, forKey: userDefaultsKey)
        UserDefaults.standard.set(expirationDate, forKey: expirationKey)
    }
}
