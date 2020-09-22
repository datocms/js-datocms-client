export default function InvalidApiRequestException(message, preCallStack) {
  if ('captureStackTrace' in Error) {
    Error.captureStackTrace(this, InvalidApiRequestException);
  } else {
    this.stack = new Error().stack;
  }

  this.message = message;
  this.stack += `\nCaused By:\n${preCallStack}`;
}
