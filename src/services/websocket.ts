const WS_URL = (process.env.REACT_APP_API_URL || 'https://safelife.up.railway.app')
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');

type MessageHandler = (data: any) => void;

class SafeLifeWebSocket {
  private ws:               WebSocket | null = null;
  private handlers:         MessageHandler[] = [];
  private pingInterval:     ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout>  | null = null;
  private shouldReconnect:  boolean = true;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    console.log('🔌 Connexion WebSocket SafeLife...');
    try {
      this.ws = new WebSocket(`${WS_URL}/ws/alertes`);
    } catch (e) {
      console.log('WebSocket non disponible — polling activé');
      return;
    }

    this.ws.onopen = () => {
      console.log('✅ WebSocket connecté');
      // Ping toutes les 25s pour maintenir la connexion
      this.pingInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send('ping');
        }
      }, 25000);
    };

    this.ws.onmessage = (event) => {
      try {
        if (event.data === 'pong') return;
        const data = JSON.parse(event.data);
        this.handlers.forEach(h => h(data));
      } catch (e) {
        console.error('Erreur parsing message WebSocket:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('🔴 WebSocket déconnecté');
      this.cleanup();
      if (this.shouldReconnect) {
        console.log('♻️ Reconnexion dans 3s...');
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      }
    };

    this.ws.onerror = () => {
      // Silencieux — onclose sera appelé après
    };
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.cleanup();
    this.ws?.close();
    this.ws = null;
  }

  reconnect() {
    this.shouldReconnect = true;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private cleanup() {
    if (this.pingInterval)     clearInterval(this.pingInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.pingInterval     = null;
    this.reconnectTimeout = null;
  }
}

// Singleton — une seule connexion pour tout le dashboard
export const wsClient = new SafeLifeWebSocket();