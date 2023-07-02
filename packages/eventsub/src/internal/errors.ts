/**
 * Throwed when you are using the connection when it is not initialized
 */
export class ConnectionClosed extends Error {
  constructor() {
    super("This connection is not ready to be used yet");
  }
}
