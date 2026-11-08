/**
 * A Baileys receipt for one member of an outbound group message proves that
 * someone received the message; it does not establish group-wide delivery.
 * Return only a SERVER_ACK, which WESSAAL records as sent (not delivered).
 * Never publish a participant JID or contents through this adapter.
 */
export function groupReceiptToServerAck(
  event: {
    key?: { id?: string | null; remoteJid?: string | null; fromMe?: boolean | null };
    receipt?: {
      receiptTimestamp?: unknown;
      readTimestamp?: unknown;
      playedTimestamp?: unknown;
    } | null;
  },
  groupsIgnore = false,
): { keyId: string; remoteJid: string; fromMe: true; status: 'SERVER_ACK' } | null {
  const key = event?.key;
  const receipt = event?.receipt;
  if (
    groupsIgnore ||
    key?.fromMe !== true ||
    typeof key.id !== 'string' ||
    key.id.length === 0 ||
    typeof key.remoteJid !== 'string' ||
    !key.remoteJid.endsWith('@g.us') ||
    !receipt ||
    (receipt.receiptTimestamp == null &&
      receipt.readTimestamp == null &&
      receipt.playedTimestamp == null)
  ) {
    return null;
  }

  return {
    keyId: key.id,
    remoteJid: key.remoteJid,
    fromMe: true,
    status: 'SERVER_ACK',
  };
}
