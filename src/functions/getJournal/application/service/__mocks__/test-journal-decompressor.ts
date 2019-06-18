import { VehicleGearbox, Initiator } from '../../../../../common/domain/Journal';

export default {
  journal: {
    testSlots: [
      {
        booking: {
          application: {
            applicationId: 1234567,
            bookingSequence: 3,
            checkDigit: 1,
            entitlementCheck: false,
            extendedTest: false,
            progressiveAccess: false,
            specialNeeds: 'Candidate has dyslexia',
            testCategory: 'A1',
            vehicleGearbox: 'Automatic' as VehicleGearbox,
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
              firstName: 'Florence',
              lastName: 'Pearson',
              title: 'Miss',
            },
            driverNumber: 'PEARS015220A99HC',
            mobileTelephone: '07654 123456',
            primaryTelephone: '01234 567890',
            secondaryTelephone: '04321 098765',
          },
          previousCancellation: [
            'Act of nature',
          ] as Initiator[],
        },
        slotDetail: {
          duration: 57,
          slotId: 1001,
          start: '2018-12-10T08:10:00+00:00',
        },
        testCentre: {
          centreId: 54321,
          centreName: 'Example Test Centre',
          costCode: 'EXTC1',
        },
        vehicleSlotType: 'B57mins',
      },
    ],
  },
  // tslint:disable-next-line:max-line-length
  compressedJournalAsBase64: Buffer.from('H4sIAAAAAAAAE11Ty27jIBT9FcR2XAmcuEm8c53MQ5qJRpMsRqq6IHCToGLwAE4TVf33udhulHZj4JzD5dyHX2mEEDfGxUDLx1e6c+5Z2wMtX6loW6OliNrZT8cfipY8n0yL+1n2fmMD/zqwEmg5yag8gnxe6oNOUXlGwUYdDTS41omi5V6YAEicI1gFaosmrmDr3cFDCPoElZS4uTKhBamFWQMoBGktrNJKRCBHEYi6BANnLWjW51QjfnD+grqKI3aCo5YGvoHwO3dOaBddg/lIJF/AhOONiTfM4T14Sv56qJTyvSMsyLD9qS1wDMfJJvbVwdUDRIx6o8hRsXENtEZgjT5Qk5GK7sUi07oQpVOQHD7wnEzqJb210xef8RtkLZre5F77EIcD/Wqc79uRUSOu6G9MPrj0St8PRH5pTAbDK4/V9uuu2YFPwlX1Z8N4keesWiy+13ijcTttYAsG2qOz6S6b3RdTMgxCMu51I/zlgyKRBMdkvmCoCCCdVZ8100nOCVvMMVpy0no4adcFbK4EY8b5e6SVjMTtiRWx80CfUBlwapcQhTYpe9X5UVvMBm6oVCpViMJja2nO+PyO53ecbdkcuZKxLyx908P90OCE+qHj/S6FKJLBbATGQq7OomkNkDQyZLyEEmxdPbRu9Xdb8xR1HLv0h20vbaIeilmjLVb96e0/Gxv6hn4DAAA=', 'base64'),
};
