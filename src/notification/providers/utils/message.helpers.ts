/**
 * Creates the user signup link which can be used in messages.
 * @param token
 * @param userId
 */
export const getUserActivationUrl = (token: string, userId: string): string => {
  const baseUrl = process.env.APP_URL || 'http://localhost:3001/';
  return `${baseUrl}user/activate/${userId}/${token}"`;
};
