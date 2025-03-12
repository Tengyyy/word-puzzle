// thrown when validating user input and the request contains unexpected data
export class ValidationException extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationException";
    this.statusCode = 400;
  }
}

// generic server error, usually not a fault of the client and can't be solved
export class ServerException extends Error {
  constructor(message) {
    super(message);
    this.name = "ServerException";
    this.statusCode = 500;
  }
}

// thrown when a request e.g. grid generation takes too long and is killed by the server
export class TimeoutException extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutException";
    this.statusCode = 408;
  }
}
