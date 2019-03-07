import * as DynamoJournalRepository from '../../../framework/aws/DynamoJournalRepository';
import { findJournal } from '../FindJournal';
import * as journalDecompressor from '../journal-decompressor';
import { Mock, It, Times } from 'typemoq';
import { ExaminerWorkSchedule } from '../../../../../common/domain/Journal';

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
    it('should return null when the repo cant get the journal', async () => {
      spyOn(DynamoJournalRepository, 'getJournal').and.returnValue(null);

      const result = await findJournal('00000000');

      expect(result).toBeNull();
    });

    it('should return null when the journal cannot be decompressed', async () => {
      const compressedJournalFromRepo = { journal: 'abc' };
      spyOn(DynamoJournalRepository, 'getJournal')
        .and.returnValue(compressedJournalFromRepo);
      moqDecompressJournal.reset();
      moqDecompressJournal.setup(x => x(It.isAny())).throws(new Error('invalid'));

      const result = await findJournal('00000000');

      expect(result).toBeNull();
    });

    it('should return the journal embedded in the wrapper', async () => {
      const compressedJournalFromRepo = { journal: 'abc' };
      spyOn(DynamoJournalRepository, 'getJournal')
        .and.returnValue(compressedJournalFromRepo);

      const result = await findJournal('00000000');

      moqDecompressJournal.verify(x => x(It.isValue('abc')), Times.once());
      // @ts-ignore
      expect(result.staffNumber).toBe('00000000');
    });
  });
});
