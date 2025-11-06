// Port: MapService (Interface)
// For route calculation, geocoding, etc.
class MapService {
  async calculateRoute(origin, destination) {
    throw new Error('Method calculateRoute() must be implemented');
  }

  async geocodeAddress(address) {
    throw new Error('Method geocodeAddress() must be implemented');
  }

  async reverseGeocode(latitude, longitude) {
    throw new Error('Method reverseGeocode() must be implemented');
  }

  async calculateETA(origin, destination) {
    throw new Error('Method calculateETA() must be implemented');
  }

  isEnabled() {
    throw new Error('Method isEnabled() must be implemented');
  }

  getStatus() {
    throw new Error('Method getStatus() must be implemented');
  }
}

module.exports = MapService;
