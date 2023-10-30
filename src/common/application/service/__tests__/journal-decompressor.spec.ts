import {compress, decompressJournal} from '../journal-decompressor';
import testJournalDecompressor from '../__mocks__/test-journal-decompressor';

describe('JournalDecompressor', () => {
  describe('decompressJournal', () => {
    it('should turn a gzip compressed + base64 encoded journal into an ExaminerWorkSchedule domain object', () => {
      const compressed = testJournalDecompressor.compressedJournalAsBase64;
      expect(decompressJournal(compressed)).toEqual(testJournalDecompressor.journal);
    });
  });
  describe('compress', () => {
    it('should compress some data into a gzipped hash', () => {
      expect(compress('hello')).toEqual('');
    });
  });
});
