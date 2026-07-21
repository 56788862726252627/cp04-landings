import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createCustomer, createStaffMember, createService, createResource, createAppointment,
  createLocation, createCommunication, createPaymentIntent, createAutomation,
  createFormDefinition, createDocumentReference, createAuditEvent,
  playerToCustomer, customerToPlayer, staffToStaffMember, staffMemberToStaff,
  courtToResource, resourceToCourt, reservationToAppointment, appointmentToReservation,
} from "./genericDomain.js";
import { cp04DemoData } from "../../data/cp04DemoData.js";

test("las 12 entidades genéricas se pueden crear con factories seguras y valores por defecto", () => {
  const factories = [
    () => createCustomer(), () => createStaffMember(), () => createService(), () => createResource(),
    () => createAppointment(), () => createLocation(), () => createCommunication(), () => createPaymentIntent(),
    () => createAutomation(), () => createFormDefinition(), () => createDocumentReference(), () => createAuditEvent(),
  ];
  const entityNames = new Set();
  for (const factory of factories) {
    const entity = factory();
    assert.ok(entity.id, "toda entidad debe tener id");
    entityNames.add(entity.entity);
  }
  assert.equal(entityNames.size, 12);
});

test("playerToCustomer / customerToPlayer son inversas para un jugador real de cp04DemoData", () => {
  const jugador = cp04DemoData.jugadores[0];
  const customer = playerToCustomer(jugador);
  assert.equal(customer.displayName, jugador.nombre);
  assert.equal(customer.metrics.ranking, jugador.ranking);
  const roundTrip = customerToPlayer(customer);
  assert.deepEqual(roundTrip, jugador);
});

test("staffToStaffMember / staffMemberToStaff son inversas para el staff real de cp04DemoData", () => {
  const staff = cp04DemoData.staff;
  const staffMember = staffToStaffMember(staff);
  const roundTrip = staffMemberToStaff(staffMember);
  assert.deepEqual(roundTrip, staff);
});

test("courtToResource / resourceToCourt son inversas para las pistas reales usadas en reservas", () => {
  for (const reserva of cp04DemoData.reservas) {
    const resource = courtToResource(reserva.pista);
    assert.equal(resource.kind, "court");
    assert.equal(resourceToCourt(resource), reserva.pista);
  }
});

test("reservationToAppointment / appointmentToReservation reconstruyen la reserva original", () => {
  for (const reserva of cp04DemoData.reservas) {
    const appointment = reservationToAppointment(reserva);
    assert.equal(appointment.dateLabel, reserva.dia);
    assert.equal(appointment.status, reserva.estado);
    const roundTrip = appointmentToReservation(appointment, { customerName: reserva.jugador, resourceLabel: reserva.pista });
    assert.deepEqual(roundTrip, reserva);
  }
});

test("los adaptadores no mutan los objetos de entrada", () => {
  const jugador = { ...cp04DemoData.jugadores[0] };
  const snapshot = JSON.stringify(jugador);
  playerToCustomer(jugador);
  assert.equal(JSON.stringify(jugador), snapshot);
});
