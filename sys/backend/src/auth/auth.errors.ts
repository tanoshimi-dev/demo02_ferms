export class UnauthenticatedError extends Error {
  constructor(message = 'unauthenticated') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}
