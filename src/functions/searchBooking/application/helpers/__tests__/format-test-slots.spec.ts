import { formatTestSlots } from '../format-test-slots';

describe('formatTestSlots', () => {

  it('returns slot when bookingReference matches the passed parameter', () => {
    const slotWithBookingRef: any = {
      booking: {
        application: {
          bookingReference: 'ABC123',
        },
      },
    };
    const slotWithoutApp: any = {booking: {}};

    const result = formatTestSlots([slotWithBookingRef, slotWithoutApp], 'ABC123');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(slotWithBookingRef);
  });

  it('returns slot when numeric application formatted by TARS matches the passed parameter', () => {
    const numericSlot: any = {
      booking: {
        application: {
          applicationId: 1,
          checkDigit: 2,
          bookingSequence: 3,
        },
      },
    };

    const result = formatTestSlots([numericSlot], '1032');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(numericSlot);
  });

  it('returns empty array when no test slot matches the passed parameter or booking.application is missing', () => {
    const slotNoApp: any = {booking: {}};
    const slotDifferentRef: any = {
      booking: {
        application: {
          bookingReference: '1',
        },
      },
    };

    const result = formatTestSlots([slotNoApp, slotDifferentRef], '2');

    expect(result.length).toBe(0);
  });
});
