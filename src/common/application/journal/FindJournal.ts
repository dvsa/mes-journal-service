import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { decompressJournal } from '../service/journal-decompressor';
import * as logger from '../utils/logger';
import { JournalRecord } from '../../domain/JournalRecord';
import { JournalNotFoundError } from '../../domain/errors/journal-not-found-error';
import { JournalDecompressionError } from '../../domain/errors/journal-decompression-error';
import { getJournal } from '../../framework/aws/DynamoJournalRepository';

/**
 * Finds a journal with a specified staffNumber.
 * Throws a JournalNotFoundError if it the repo could not find one.
 * Throws a JournalDecompressionError if decompression fails
 * @param staffNumber the staff number of the journal to find
 */
export async function findJournal(
  staffNumber: string,
  modifiedSinceTimestamp: number | null,
): Promise<ExaminerWorkSchedule | null> {
  const journalRecord = await getJournal(staffNumber);
  if (!journalRecord) {
    throw new JournalNotFoundError();
  }
  if (journalNotModifiedSince(journalRecord, modifiedSinceTimestamp)) {
    return null;
  }

  try {
    return decompressJournal(journalRecord.journal);
  } catch (error) {
    logger.error(error as string);
    throw new JournalDecompressionError();
  }
}

const journalNotModifiedSince = (journalRecord: JournalRecord, modifiedSinceTimestamp: number | null): boolean => {
  return !!modifiedSinceTimestamp && journalRecord.lastUpdatedAt <= modifiedSinceTimestamp;
};

export async function findJournalWithResponse(
  staffNumber: string,
): Promise<ExaminerWorkSchedule | { error: string }> {
  const journalRecord = await getJournal(staffNumber);
  if (!journalRecord) {
    // return journal not found error instead of throwing which would stop execution
    return { error: 'Journal not found' };
  }

  try {
    return decompressJournal(journalRecord.journal);
  } catch (error) {
    logger.error(error as string);
    // return journal decompression error instead of throwing which would stop execution
    return { error: 'Journal decompression error' };
  }
}
