import {VehicleGearbox, Initiator, ExaminerWorkSchedule, TestSlot} from '@dvsa/mes-journal-schema';

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
      },
    ] as TestSlot[],
  } as ExaminerWorkSchedule,
  // eslint-disable-next-line
  compressedJournalAsBase64: Buffer.from('H4sIAAAAAAAAA11STW/iMBD9K5avm0p2gAK5ZQP7Ie2i1cKhUtWDsQew6thZ26EgxH/fcZIi2ktiv/dm/ObjQiOEuDYuBlo8X+jWuVdt97S4UNE0RksRtbOfrj8VLXg+Gk8ep9l7xBr+tWAl0GKUUXkA+brQex1RmFGwUUcDNf6rxNBiJ0wAJE4RrAK1QQ83sPFu7yEEfYRSSjzcmNCA1MKsABSCtBJWaSUikIMIRJ2DgZMWNOtKqhDfO39GXckRO8JBSwPfQfitOyW0ja7GciSSb2DC4c7EFUt4T55qv11KpXznCPvRH39pCxzTcbKOXXPw7wEiZr1T5KhYuxoaI7BFH6jRQEX3ZpFpXIjSKUgOv/KcjKoFvbfT9Z7xO2Ql6s7kTvsQ+wv9ZpzvppFRI27oHyw+uPRKNw9EfmssBtMrj932q7begk/CZfl3zfgkz1k5n/+oMKJ2W21gAwaag7Mplk0fJ2PS70Ey7nUt/PmDIpEEt2Q2Z6gIIJ1VnzXjUc4Jm88wW3LSeDhq1wYcrgRjhvV7pqWMxO2IFbH1QF9QGXBpFxCFNql61fpBO5n2XN+p1KoQhcfR0pzx2QPPHzjbsBlyBWNfWPqmh7ulwQ31/cS7U0oxSQazARgauTyJujFA0sqQIQglOLqqH93yaVNxer2+XP8DN5PpE2EDAAA=', 'base64'),
};
