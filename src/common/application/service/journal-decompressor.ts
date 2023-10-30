import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import {gunzipSync, gzipSync} from 'zlib';

export const decompressJournal = (compressedJournal: Buffer): ExaminerWorkSchedule => {
  const unzippedJson = gunzipSync(compressedJournal).toString();
  return JSON.parse(unzippedJson) as ExaminerWorkSchedule;
};

export const compress = <T>(data: T): string => gzipSync(JSON.stringify(data)).toString('base64');
