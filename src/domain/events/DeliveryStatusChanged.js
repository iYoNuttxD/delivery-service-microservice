// Domain Event: DeliveryStatusChanged
class DeliveryStatusChanged {
  constructor(deliveryId, oldStatus, newStatus, additionalData = {}) {
    this.deliveryId = deliveryId;
    this.oldStatus = oldStatus;
    this.newStatus = newStatus;
    this.timestamp = new Date().toISOString();
    this.additionalData = additionalData;
  }

  toPayload() {
    return {
      deliveryId: this.deliveryId,
      oldStatus: this.oldStatus,
      status: this.newStatus,
      timestamp: this.timestamp,
      ...this.additionalData
    };
  }
}

module.exports = DeliveryStatusChanged;
