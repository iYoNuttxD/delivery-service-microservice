// Port: PolicyClient (Interface)
// For authorization checks via OPA or similar
class PolicyClient {
  async checkAuthorization(input) {
    throw new Error('Method checkAuthorization() must be implemented');
  }

  async authorizeDeliveryAccess(userId, deliveryId, action) {
    throw new Error('Method authorizeDeliveryAccess() must be implemented');
  }

  async authorizeDriverAction(driverId, action, resourceType, resourceId) {
    throw new Error('Method authorizeDriverAction() must be implemented');
  }

  async authorizeAdminAction(adminId, action, resourceType) {
    throw new Error('Method authorizeAdminAction() must be implemented');
  }

  isEnabled() {
    throw new Error('Method isEnabled() must be implemented');
  }

  getStatus() {
    throw new Error('Method getStatus() must be implemented');
  }
}

module.exports = PolicyClient;
