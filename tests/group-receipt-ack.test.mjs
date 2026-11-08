import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = readFileSync(new URL('../src/utils/groupReceiptAck.ts', import.meta.url), 'utf8');
const javascript = stripTypeScriptTypes(source, { mode: 'strip' });
const { groupReceiptToServerAck } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));

const outbound = {
  key: { id: 'TEST_ID', remoteJid: '12345678901-12345@g.us', fromMe: true },
  receipt: { receiptTimestamp: 100 },
};

test('a member receipt is sent, not delivered to the entire group', () => {
  assert.deepEqual(groupReceiptToServerAck(outbound), {
    keyId: 'TEST_ID',
    remoteJid: '12345678901-12345@g.us',
    fromMe: true,
    status: 'SERVER_ACK',
  });
});

test('ignores inbound group receipts', () => {
  assert.equal(groupReceiptToServerAck({ ...outbound, key: { ...outbound.key, fromMe: false } }), null);
});

test('ignores personal-message receipts', () => {
  assert.equal(groupReceiptToServerAck({ ...outbound, key: { ...outbound.key, remoteJid: '123@s.whatsapp.net' } }), null);
});

test('ignores missing proof, disabled group processing, and empty IDs', () => {
  assert.equal(groupReceiptToServerAck({ ...outbound, receipt: {} }), null);
  assert.equal(groupReceiptToServerAck(outbound, true), null);
  assert.equal(groupReceiptToServerAck({ ...outbound, key: { ...outbound.key, id: '' } }), null);
});

test('member read receipt still only signals sent', () => {
  assert.equal(groupReceiptToServerAck({ ...outbound, receipt: { readTimestamp: 100 } })?.status, 'SERVER_ACK');
});
