import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PROVIDER_INTERFACES,
  FUTURE_PROVIDER_IMPLEMENTATIONS,
  findMissingInterfaceMethods,
  implementsInterface,
  createMockDataRepository,
  createMockAutomationProvider,
  createMockPaymentProvider,
  createMockMessagingProvider,
  createMockEmailProvider,
  createMockCalendarProvider,
  createMockFileStorageProvider,
  createMockAnalyticsProvider,
} from "./providerAdapters.js";

const MOCK_FACTORIES = {
  DataRepository: createMockDataRepository,
  AutomationProvider: createMockAutomationProvider,
  PaymentProvider: createMockPaymentProvider,
  MessagingProvider: createMockMessagingProvider,
  EmailProvider: createMockEmailProvider,
  CalendarProvider: createMockCalendarProvider,
  FileStorageProvider: createMockFileStorageProvider,
  AnalyticsProvider: createMockAnalyticsProvider,
};

test("las 8 interfaces de proveedor pedidas están definidas", () => {
  assert.deepEqual(Object.keys(PROVIDER_INTERFACES).sort(), Object.keys(MOCK_FACTORIES).sort());
});

test("cada mock local implementa completamente su interfaz declarada", () => {
  for (const [interfaceName, factory] of Object.entries(MOCK_FACTORIES)) {
    const missing = findMissingInterfaceMethods(interfaceName, factory());
    assert.deepEqual(missing, [], `${interfaceName}: métodos ausentes en el mock: ${missing.join(", ")}`);
    assert.equal(implementsInterface(interfaceName, factory()), true);
  }
});

test("findMissingInterfaceMethods lanza para una interfaz desconocida", () => {
  assert.throws(() => findMissingInterfaceMethods("NoExiste", {}));
});

test("las 7 futuras implementaciones reales están documentadas y ninguna está marcada como implementada", () => {
  assert.equal(FUTURE_PROVIDER_IMPLEMENTATIONS.length, 7);
  assert.ok(FUTURE_PROVIDER_IMPLEMENTATIONS.every((impl) => impl.status === "not_implemented"));
});

test("DataRepository mock: create/list/get/update/remove funcionan en memoria sin I/O real", async () => {
  const repo = createMockDataRepository();
  const created = await repo.create("customers", { displayName: "Ana" });
  assert.ok(created.id);
  const list = await repo.list("customers");
  assert.equal(list.length, 1);
  const fetched = await repo.get("customers", created.id);
  assert.equal(fetched.displayName, "Ana");
  const updated = await repo.update("customers", created.id, { displayName: "Ana Torres" });
  assert.equal(updated.displayName, "Ana Torres");
  const removed = await repo.remove("customers", created.id);
  assert.equal(removed, true);
  assert.deepEqual(await repo.list("customers"), []);
});

test("AutomationProvider mock nunca reporta connected:true", async () => {
  const provider = createMockAutomationProvider(["alta_cliente"]);
  await provider.trigger("alta_cliente", { customerId: "c1" });
  const status = await provider.getStatus();
  assert.equal(status.connected, false);
  assert.equal(status.triggeredCount, 1);
});

test("PaymentProvider mock nunca marca un pago como succeeded sin mock/ prefijo", async () => {
  const provider = createMockPaymentProvider();
  const intent = await provider.createPaymentIntent({ amount: 1000 });
  assert.ok(intent.status.includes("mock"));
  const confirmed = await provider.confirmPayment(intent.id);
  assert.ok(confirmed.status.includes("mock"));
});

test("MessagingProvider y EmailProvider mocks solo encolan, nunca envían de verdad", async () => {
  const messaging = createMockMessagingProvider();
  const msg = await messaging.sendMessage("+34600000000", "recordatorio_cita");
  assert.equal(msg.status, "queued_mock");

  const email = createMockEmailProvider();
  const mail = await email.sendEmail("cliente@example.com", "Recordatorio");
  assert.equal(mail.status, "queued_mock");
});
