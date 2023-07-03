export class ConnectionClosed extends Error {
  /**
   * Threw when you are using the connection when it is not initialized
   */
  constructor(message?: string) {
    super(message ?? "This connection is not ready to be used yet");
  }
}
