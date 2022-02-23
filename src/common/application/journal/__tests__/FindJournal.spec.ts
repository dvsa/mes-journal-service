import * as DynamoJournalRepository from '../../../framework/aws/DynamoJournalRepository';
import { findJournal, findJournalWithResponse } from '../FindJournal';
import * as journalDecompressor from '../../service/journal-decompressor';
import { Mock, It, Times } from 'typemoq';
import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { JournalNotFoundError } from '../../../domain/errors/journal-not-found-error';
import { JournalDecompressionError } from '../../../domain/errors/journal-decompression-error';

const moqDecompressJournal = Mock.ofInstance(journalDecompressor.decompressJournal);

const dummyWorkSchedule = Mock.ofType<ExaminerWorkSchedule>();
dummyWorkSchedule.setup((x: any) => x.staffNumber).returns(() => '00000000');
dummyWorkSchedule.setup((x: any) => x.then).returns(() => null);

describe('FindJournal', () => {
  beforeEach(() => {
    moqDecompressJournal.reset();

    spyOn(journalDecompressor, 'decompressJournal').and.callFake(moqDecompressJournal.object);

    moqDecompressJournal.setup(x => x(It.isAny())).returns(() => dummyWorkSchedule.object);
  });

  describe('findJournal', () => {
    it('should throw JournalNotFoundError when the repo cant get the journal', async () => {
      spyOn(DynamoJournalRepository, 'getJournal').and.returnValue(null);

      try {
        await findJournal('00000000', null);
      } catch (err) {
        expect(err instanceof JournalNotFoundError).toBe(true);
        return;
      }
      fail();
    });

    it('should throw a JournalDecompressionError when the journal cannot be decompressed', async () => {
      const compressedJournalFromRepo = { journal: 'abc' };
      spyOn(DynamoJournalRepository, 'getJournal')
        .and.returnValue(compressedJournalFromRepo);
      moqDecompressJournal.reset();
      moqDecompressJournal.setup(x => x(It.isAny())).throws(new Error('invalid'));

      try {
        await findJournal('00000000', null);
      } catch (err) {
        expect(err instanceof JournalDecompressionError).toBeTruthy();
        return;
      }
      fail();
    });

    it('should return the journal embedded in the wrapper', async () => {
      const compressedJournalFromRepo = { journal: Buffer.from('abc') };
      spyOn(DynamoJournalRepository, 'getJournal')
        .and.returnValue(compressedJournalFromRepo);

      const result = await findJournal('00000000', null);

      moqDecompressJournal.verify(x => x(It.isValue(Buffer.from('abc'))), Times.once());
      // @ts-ignore
      expect(result.staffNumber).toBe('00000000');
    });

    describe('update time checking', () => {
      it('should return null when the journal found has a lastUpdatedAt leq the last updated timestamp', async () => {
        const compressedJournalFromRepo = { journal: Buffer.from('abc'), lastUpdatedAt: 123 };
        spyOn(DynamoJournalRepository, 'getJournal')
          .and.returnValue(compressedJournalFromRepo);

        const result = await findJournal('00000000', 123);

        expect(result).toBeNull();
      });
    });
  });

  describe('findJournalWithResponse', () => {
    it('should return the journal embedded in the wrapper', async () => {
      const compressedJournalFromRepo = { journal: Buffer.from('abc') };
      spyOn(DynamoJournalRepository, 'getJournal')
        .and.returnValue(compressedJournalFromRepo);

      const result = await findJournalWithResponse('00000000');

      moqDecompressJournal.verify(x => x(It.isValue(Buffer.from('abc'))), Times.once());
      // @ts-ignore
      expect(result.staffNumber).toBe('00000000');
    });

    it('should return Journal not found error object', async () => {
      spyOn(DynamoJournalRepository, 'getJournal').and.returnValue(Promise.resolve(null));
      const result = await findJournalWithResponse('00000000');
      expect(result).toEqual({ error: 'Journal not found' });
    });

    it('should return Journal decompression error object', async () => {
      const compressedJournalFromRepo = { journal: 'abc' };
      spyOn(DynamoJournalRepository, 'getJournal')
        .and.returnValue(compressedJournalFromRepo);
      moqDecompressJournal.reset();
      moqDecompressJournal.setup(x => x(It.isAny())).throws(new Error('invalid'));

      const result = await findJournalWithResponse('00000000');
      expect(result).toEqual({ error: 'Journal decompression error' });
    });
  });
});
