import { ExaminerWorkSchedule } from '../../../../common/domain/Journal';
import { gunzipSync } from 'zlib';

export const decompressJournal = (compressedJournal: string): ExaminerWorkSchedule => {
  const gzippedBytes = Buffer.from(compressedJournal, 'base64');
  const unzippedJson = gunzipSync(gzippedBytes).toString();
  return JSON.parse(unzippedJson) as ExaminerWorkSchedule;
};
