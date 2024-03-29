import { UserDto } from '../../user/dto/user.dto';
import { CleanUpResultDto } from '../../media/dto/clean-up-result.dto';

export interface NotificationRecipient {
  name?: string;
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

  /**
   * Notifies administrators about a clean up operation and returns whether it
   * was succesful.
   * @param results
   */
  sendCleanUpResults: (results: CleanUpResultDto) => Promise<boolean>;

  /**
   * Notifies a user about their pending password reset request.
   * @param user
   * @param token
   */
  sendPasswordResetRequestMessage: (
    token: string,
    recipient: UserDto,
  ) => Promise<boolean>;
}

/**
 * Used by nestjs to
 */
export const NotificationServiceInterface = Symbol(
  'NotificationServiceInterface',
);
