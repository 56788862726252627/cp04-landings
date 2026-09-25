/**
 * CORE V1.3 · BookingAdapter
 * mock: slots ficticios. real-placeholder: falla seguro.
 */

import { AUTH_MODE } from '../runtimeConfig.js';

export class BookingAdapter {
  constructor(config = {}) {
    this.mode   = config.authMode ?? AUTH_MODE.MOCK;
    this.status = 'initialized';
    this._bookings = new Map();
  }

  async getSlots(filters = {}) {
    if (this.mode === AUTH_MODE.MOCK) return this._mockSlots(filters);
    return this._realPlaceholder('getSlots', 'BOOKING_API_URL');
  }

  async createBooking(data) {
    if (this.mode === AUTH_MODE.MOCK) {
      const id = `mock-booking-${Date.now()}`;
      const booking = { id, ...data, estado: 'confirmada', _ficticio: true, createdAt: new Date().toISOString() };
      this._bookings.set(id, booking);
      return booking;
    }
    return this._realPlaceholder('createBooking', 'BOOKING_API_URL, BOOKING_API_KEY');
  }

  async cancelBooking(bookingId) {
    if (this.mode === AUTH_MODE.MOCK) {
      const b = this._bookings.get(bookingId);
      if (!b) return null;
      const updated = { ...b, estado: 'cancelada', cancelledAt: new Date().toISOString() };
      this._bookings.set(bookingId, updated);
      return updated;
    }
    return this._realPlaceholder('cancelBooking', 'BOOKING_API_URL');
  }

  async rescheduleBooking(bookingId, newSlot) {
    if (this.mode === AUTH_MODE.MOCK) {
      const b = this._bookings.get(bookingId);
      if (!b) return null;
      const updated = { ...b, ...newSlot, estado: 'reprogramada', updatedAt: new Date().toISOString() };
      this._bookings.set(bookingId, updated);
      return updated;
    }
    return this._realPlaceholder('rescheduleBooking', 'BOOKING_API_URL');
  }

  getStatus() {
    return { adapter: 'booking', mode: this.mode, status: this.status, bookings: this._bookings.size };
  }

  _mockSlots() {
    return [
      { id: 'slot-001', fecha: '2026-09-01 (ficticio)', hora: '10:00', disponible: true, _ficticio: true },
      { id: 'slot-002', fecha: '2026-09-01 (ficticio)', hora: '11:00', disponible: true, _ficticio: true },
      { id: 'slot-003', fecha: '2026-09-02 (ficticio)', hora: '16:30', disponible: false, _ficticio: true },
    ];
  }

  _realPlaceholder(method, requiredEnvVars) {
    const err = new Error(`BookingAdapter.${method}: modo real no configurado. Variables: ${requiredEnvVars}.`);
    err.code = 'ADAPTER_NOT_CONFIGURED'; err.adapter = 'booking'; err.method = method;
    throw err;
  }
}
