import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';

export type Examiner = {
  name: string;
  staffNumber: string;
  journal?: ExaminerWorkSchedule | null;
  error?: string;
};

export type TestCentre = {
  costCode: string;
  name: string;
};

export interface TestCentreDetail {
  staffNumber: string;
  examiners: Examiner[];
  testCentreCostCodes: string[];
}

export interface TestCentreDetailResponse {
  staffNumber: string;
  examiners: Examiner[];
  testCentres: TestCentre[];
}
