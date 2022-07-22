import { TokenizedMessage } from '../../enums/tokenized-message';

/**
 * Creates a tokenized link for a given message type which can be used in
 * messages that require a user to click on the link.
 * @param baseUrl
 * @param token
 * @param userId
 * @param messageType
 */
export const getTokenizedLinkForUser = (
  baseUrl: string,
  token: string,
  userId: string,
  messageType: TokenizedMessage,
): string => {
  return `${baseUrl}${messageType}${userId}/${token}"`;
};
