import { VehicleGearbox, Initiator } from '@dvsa/mes-journal-schema';

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
  // eslint-disable-next-line
  compressedJournalAsBase64: Buffer.from('H4sIALSHEF0AA11TTW/jIBD9K4jruhI4cZP45jrZD2k3Wm1yWKnqgcAkQcXgBZwmqvrfd7DdKO3FwHuPYebN+JVGCHFjXAy0fHylO+eetT3Q8pWKtjVaiqid/XT8oWjJ88m0uJ9l7zc28K8DK4GWk4zKI8jnpT7oiMKMgo06GmhwrRNDy70wAZA4R7AK1BZzuIKtdwcPIegTVFLi5sqEFqQWZg2gEKS1sEorEYEcRSDqEgyctaBZX1KN+MH5C+oqjtgJjloa+AbC79w5oV10DZYjkXwBE443SbxhCe/BU+3XQ6WU7zNCP4btT22BYzhONrE3B1cPEDHqjSJHxcY10BqBFn2gJiMV3YtFpnUhSqcgZfjAczKpl/Q2nd57xm+QtWj6JPfahzgc6FfjfN+NjBpxRX9j8cGlV/p+IPJLYzEYXnl026+7Zgc+CVfVnw3jRZ6zarH4XuONxu20gS0YaI/Oprtsdl9MyTAHKXGvG+EvHxSJJDgl8wVDRQDprPqsmU5yTthijtFSJq2Hk3ZdwOZKMGYcv0dayUjcnlgROw/0CZUBh3YJUWiTqledH7XFbOAGp5JVIQqPraU54/M7nt9xtmVz5ErGvrD0TQ/3Q4MT6oeO97sUokgJZiMwGrk6i6Y1QNLIkPESSrB19dC61d9tzVPUcezSD7a9tIl6KGaNtuj609t/w2rzvX0DAAA=', 'base64'),
};
