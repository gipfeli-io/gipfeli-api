import { SendGridMessageInterface } from './send-grid-message.interface';
import { CleanUpResultDto } from '../../../../media/dto/clean-up-result.dto';

class CleanUpNotificationMessage {
  public static getMessage(
    results: CleanUpResultDto,
  ): SendGridMessageInterface {
    const textResults = CleanUpNotificationMessage.getStatisticsContent(
      'text',
      results,
    );
    const htmlResults = CleanUpNotificationMessage.getStatisticsContent(
      'html',
      results,
    );

    return {
      subject: 'gipfeli.io Database and Storage Cleanup Results',
      text: `Hi there!\n\nAnother database and storage cleanup run just finished. Here are the results:\n\n${textResults}\n\nSee you,\nyour gipfeli.io Team`,
      html: `Hi there!<br><br>Another database and storage cleanup run just finished. Here are the results:<br><br>${htmlResults}<br><br>See you,<br>your gipfeli.io Team`,
    };
  }

  private static getStatisticsContent(
    type: 'text' | 'html',
    results: CleanUpResultDto,
  ): string {
    const { database, storage } = results;
    const separator = type === 'text' ? '\n' : '<br>';
    const errors = storage.errors.map((error) => `===> ${error + separator}`);

    return (
      `=> DB removals: ${database.affected + separator}` +
      `=> Storage operations: ${storage.totalOperations + separator}` +
      `=> Storage successes: ${storage.successfulOperations + separator}` +
      `=> Storage errors: ${storage.errors.length + separator}` +
      errors
    );
  }
}

export default CleanUpNotificationMessage;
