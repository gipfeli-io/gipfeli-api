/**
 * Maps the message type to an activation path. Used with the message helper to
 * generate tokenized URLs for user actions.
 */
export enum TokenizedMessage {
  SIGNUP = 'user/activate/',
  PASSWORD_RESET = 'password-reset/',
}
