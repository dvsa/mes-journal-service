import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { gunzipSync } from 'zlib';

export const decompressJournal = (compressedJournal: Buffer): ExaminerWorkSchedule => {
  const unzippedJson = gunzipSync(compressedJournal).toString();
  return JSON.parse(unzippedJson) as ExaminerWorkSchedule;
};
