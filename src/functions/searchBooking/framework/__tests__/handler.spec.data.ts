import { ApplicationReference } from '@dvsa/mes-test-schema/categories/common';
import { ExaminerWorkSchedule, TestSlot } from '@dvsa/mes-journal-schema';

export const correctStaffNumber = '12345678';

export const correctAppRefString = '1234567031';
export const correctAppRef: ApplicationReference = {
  applicationId: 1234567,
  bookingSequence: 3,
  checkDigit: 1,
};

export const incorrectAppRefString = '12345670';

export const incorrectStaffNumber = '123';

export const resultTestSlot: TestSlot = {
  booking: {
    application: {
      applicationId: correctAppRef.applicationId,
      bookingSequence: correctAppRef.bookingSequence,
      checkDigit: correctAppRef.checkDigit,
      entitlementCheck: false,
      extendedTest: false,
      progressiveAccess: false,
      specialNeeds: 'Candidate has dyslexia',
      specialNeedsCode: 'YES',
      specialNeedsExtendedTest: false,
      testCategory: 'A1',
      vehicleGearbox: 'Automatic',
      welshTest: false,
    },
    candidate: {
      candidateAddress: {
        addressLine1: '1 Station Street',
        addressLine2: 'Someplace',
        addressLine3: 'Sometown',
        postcode: 'AB12 3CD',
      },
      candidateId: 101,
      candidateName: {
        firstName: 'Florences',
        lastName: 'Pearson',
        title: 'Miss',
      },
      driverNumber: 'PEARS015220A99HC',
      mobileTelephone: '07654 123456',
      primaryTelephone: '01234 567890',
      secondaryTelephone: '04321 098765',
      dateOfBirth: '1998-01-31',
      gender: 'F',
    },
    previousCancellation: [
      'Act of nature',
    ],
  },
  slotDetail: {
    duration: 57,
    slotId: 1001,
    start: '2019-07-30T08:10:00',
  },
  testCentre: {
    centreId: 54321,
    centreName: 'Example Test Centre',
    costCode: 'EXTC1',
  },
  vehicleSlotTypeCode: 7,
  examinerVisiting: false,
};

export const findJournalResult: ExaminerWorkSchedule = {
  examiner: {
    staffNumber: correctStaffNumber,
    individualId: 9000000,
  },
  nonTestActivities: [],
  testSlots: [
    resultTestSlot,
    {
      booking: {
        application: {
          applicationId: 1234569,
          bookingSequence: 1,
          checkDigit: 9,
          entitlementCheck: false,
          extendedTest: false,
          progressiveAccess: false,
          specialNeedsCode: 'NONE',
          specialNeedsExtendedTest: false,
          testCategory: 'B1',
          vehicleGearbox: 'Automatic',
          welshTest: false,
        },
        candidate: {
          candidateAddress: {
            addressLine1: 'My House',
            addressLine2: 'Someplace',
            addressLine3: 'Sometown',
            postcode: 'AB45 6CD',
          },
          candidateId: 103,
          candidateName: {
            firstName: 'Jane',
            lastName: 'Doe',
            title: 'Mrs',
          },
          driverNumber: 'DOEXX625220A99HC',
          mobileTelephone: '07654 123456',
          dateOfBirth: '1992-01-09',
          gender: 'F',
        },
        previousCancellation: [
          'DSA',
          'Act of nature',
        ],
      },
      slotDetail: {
        duration: 57,
        slotId: 1003,
        start: '2019-07-30T10:14:00',
      },
      testCentre: {
        centreId: 54321,
        centreName: 'Example Test Centre',
        costCode: 'EXTC1',
      },
      vehicleSlotTypeCode: 7,
      examinerVisiting: false,
    },
    {
      booking: {
        application: {
          applicationId: 1234570,
          bookingSequence: 2,
          checkDigit: 2,
          entitlementCheck: false,
          extendedTest: false,
          progressiveAccess: false,
          specialNeedsCode: 'NONE',
          specialNeedsExtendedTest: false,
          testCategory: 'C1+E',
          vehicleGearbox: 'Manual',
          vehicleHeight: 5,
          vehicleLength: 10,
          vehicleSeats: 2,
          vehicleWidth: 2.5,
          welshTest: false,
        },
        candidate: {
          candidateAddress: {
            addressLine1: '999 Letsby Avenue',
            addressLine2: 'Someplace',
            addressLine3: 'Sometown',
            postcode: 'AB67 8CD',
          },
          candidateId: 104,
          candidateName: {
            firstName: 'Theresa',
            lastName: 'Shaw',
            title: 'Miss',
          },
          driverNumber: 'SHAWX885220A99HC',
          mobileTelephone: '07654 123456',
          dateOfBirth: '1980-12-17',
          gender: 'F',
        },
      },
      slotDetail: {
        duration: 57,
        slotId: 1004,
        start: '2019-07-30T11:11:00',
      },
      testCentre: {
        centreId: 54321,
        centreName: 'Example Test Centre',
        costCode: 'EXTC1',
      },
      vehicleSlotTypeCode: 7,
      examinerVisiting: false,
    },
    {
      booking: {
        application: {
          applicationId: 1234571,
          bookingSequence: 2,
          checkDigit: 6,
          entitlementCheck: false,
          extendedTest: false,
          progressiveAccess: false,
          specialNeedsCode: 'NONE',
          specialNeedsExtendedTest: false,
          testCategory: 'D',
          vehicleGearbox: 'Automatic',
          vehicleHeight: 4,
          vehicleLength: 8.5,
          vehicleSeats: 20,
          vehicleWidth: 3.5,
          welshTest: false,
        },
        candidate: {
          candidateAddress: {
            addressLine1: '1 Station Street',
            addressLine2: 'Someplace',
            addressLine3: 'Somearea',
            addressLine4: 'Somecity',
            postcode: 'UB40 1AA',
          },
          candidateId: 105,
          candidateName: {
            firstName: 'Ali',
            lastName: 'Campbell',
            title: 'Mr',
          },
          driverNumber: 'CAMPB805220A89HC',
          mobileTelephone: '07654 123456',
          primaryTelephone: '01234 567890',
          dateOfBirth: '1975-01-10',
          gender: 'M',
        },
      },
      slotDetail: {
        duration: 57,
        slotId: 1005,
        start: '2019-07-30T12:38:00',
      },
      testCentre: {
        centreId: 54321,
        centreName: 'Example Test Centre',
        costCode: 'EXTC1',
      },
      vehicleSlotTypeCode: 7,
      examinerVisiting: false,
    },
    {
      booking: {
        application: {
          applicationId: 1234572,
          bookingSequence: 1,
          checkDigit: 3,
          entitlementCheck: false,
          extendedTest: false,
          progressiveAccess: false,
          specialNeedsCode: 'NONE',
          specialNeedsExtendedTest: false,
          testCategory: 'D+E',
          vehicleGearbox: 'Manual',
          vehicleHeight: 5,
          vehicleLength: 15,
          vehicleSeats: 50,
          vehicleWidth: 2,
          welshTest: false,
        },
        candidate: {
          candidateAddress: {
            addressLine1: 'The Gables Cottage',
            addressLine2: 'Home Farm',
            addressLine3: 'Farm Road',
            addressLine4: 'Farm Area',
            addressLine5: 'Farmtown',
            postcode: 'FA43 9XY',
          },
          candidateId: 106,
          candidateName: {
            firstName: 'James',
            lastName: 'Brown',
            title: 'Mr',
          },
          driverNumber: 'BROWN915220A99HC',
          mobileTelephone: '07654 123456',
          primaryTelephone: '01234 567890',
          secondaryTelephone: '04321 098765',
          dateOfBirth: '1998-07-06',
          gender: 'M',
        },
      },
      slotDetail: {
        duration: 57,
        slotId: 1006,
        start: '2019-07-30T13:35:00',
      },
      testCentre: {
        centreId: 54321,
        centreName: 'Example Test Centre',
        costCode: 'EXTC1',
      },
      vehicleSlotTypeCode: 7,
      examinerVisiting: false,
    },
    {
      booking: {
        application: {
          applicationId: 1234573,
          bookingSequence: 7,
          checkDigit: 7,
          entitlementCheck: false,
          extendedTest: false,
          progressiveAccess: false,
          specialNeedsCode: 'NONE',
          specialNeedsExtendedTest: false,
          testCategory: 'B',
          vehicleGearbox: 'Manual',
          welshTest: true,
        },
        candidate: {
          candidateAddress: {
            addressLine1: '1 Hangar Lane',
            addressLine2: 'Someplace',
            addressLine3: 'Sometown',
            postcode: 'AB78 9CD',
          },
          candidateId: 107,
          candidateName: {
            firstName: 'Montague',
            lastName: 'Smythe',
            title: 'Captain',
          },
          driverNumber: 'SMYTH375220A99HC',
          primaryTelephone: '01234 567890',
          dateOfBirth: '1998-07-06',
          gender: 'M',
        },
      },
      slotDetail: {
        duration: 57,
        slotId: 1007,
        start: '2019-07-30T14:32:00',
      },
      testCentre: {
        centreId: 54321,
        centreName: 'Example Test Centre',
        costCode: 'EXTC1',
      },
      vehicleSlotTypeCode: 7,
      examinerVisiting: false,
    },
  ],
};
