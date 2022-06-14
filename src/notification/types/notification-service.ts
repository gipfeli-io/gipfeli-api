import { UserDto } from '../../user/dto/user';

export interface NotificationRecipient {
  name: string;
  email: string;
}

export interface NotificationService {
  /**
   * Sends a debug message and returns whether it was succesful.
   * @param message
   * @param recipient
   */
  sendDebugMessage: (
    message: string,
    recipient: NotificationRecipient,
  ) => Promise<boolean>;

  /**
   * Send signup notification to a User that contains introductory text as well
   * as a link with the correct token to activate.
   * @param token
   * @param recipient
   */
  sendSignUpMessage: (token: string, recipient: UserDto) => Promise<boolean>;
}

/**
 * Used by nestjs to
 */
export const NotificationServiceInterface = Symbol(
  'NotificationServiceInterface',
);
