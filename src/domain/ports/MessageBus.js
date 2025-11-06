// Port: MessageBus (Interface)
// For publishing and subscribing to events
class MessageBus {
  async publish(subject, event) {
    throw new Error('Method publish() must be implemented');
  }

  async subscribe(subject, handler) {
    throw new Error('Method subscribe() must be implemented');
  }

  getStatus() {
    throw new Error('Method getStatus() must be implemented');
  }

  isConnected() {
    throw new Error('Method isConnected() must be implemented');
  }
}

module.exports = MessageBus;
