export async function listTargets(port) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: controller.signal });
    if (!response.ok) throw new Error(`DevTools discovery failed: HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export class CdpClient {
  constructor(url, expectedPort) {
    const parsed = new URL(url);
    const loopback = new Set(["127.0.0.1", "localhost", "[::1]"]);
    if (parsed.protocol !== "ws:" || !loopback.has(parsed.hostname) || Number(parsed.port) !== expectedPort) {
      throw new Error(`Rejected non-loopback DevTools URL: ${parsed.href}`);
    }
    this.url = parsed.href;
    this.sequence = 0;
    this.pending = new Map();
    this.scriptIdentifier = null;
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("DevTools connection timed out")), 5000);
      this.socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
      this.socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("DevTools connection failed")); }, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject, timeout } = this.pending.get(message.id);
      clearTimeout(timeout);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    });
    this.socket.addEventListener("close", () => {
      for (const { reject, timeout } of this.pending.values()) {
        clearTimeout(timeout);
        reject(new Error("DevTools connection closed"));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}) {
    const id = ++this.sequence;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`DevTools command timed out: ${method}`));
      }, 10000);
      this.pending.set(id, { resolve, reject, timeout });
    });
  }

  close() {
    this.socket?.close();
  }
}
