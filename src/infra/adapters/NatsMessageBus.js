const natsClient = require('../../messaging/natsClient');

// MessageBus implementation using NATS
class NatsMessageBus {
  constructor() {
    this.natsClient = natsClient;
  }

  async publish(subject, event) {
    try {
      const success = await this.natsClient.publish(subject, event);
      return success;
    } catch (error) {
      return false;
    }
  }

  async subscribe(subject, handler) {
    return this.natsClient.subscribe(subject, handler);
  }

  getStatus() {
    return this.natsClient.getStatus();
  }

  isConnected() {
    return this.natsClient.isConnected;
  }
}

module.exports = new NatsMessageBus();
