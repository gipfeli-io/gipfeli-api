/**
 * Creates the user signup link which can be used in messages.
 * @param baseUrl
 * @param token
 * @param userId
 */
export const getUserActivationUrl = (
  baseUrl: string,
  token: string,
  userId: string,
): string => {
  return `${baseUrl}user/activate/${userId}/${token}"`;
};
