import {get} from 'lodash';
import {ApplicationReference} from '@dvsa/mes-test-schema/categories/common';
import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {TestSlot} from '@dvsa/mes-journal-schema';

export const formatTestSlots = (testSlots: TestSlot[] = [], parameterAppRef: number | string) => {
  return testSlots.map((testSlot) => {
    if (get(testSlot, 'booking.application', null)) {
      const application = get(testSlot, 'booking.application', null);
      // Get the booking id (only present on DSP bookings)
      const bookingId = application?.bookingId;
      const currentAppRef: ApplicationReference = {
        applicationId: application?.applicationId || 0,
        checkDigit: application?.checkDigit || 0,
        bookingSequence: application?.bookingSequence || 0,
      };

      const formattedSlotAppRef = formatApplicationReference(currentAppRef);
      // If we have a booking id to use for the comparison, use it
      if (bookingId ? (bookingId === parameterAppRef) : (parameterAppRef === formattedSlotAppRef)) {
        return testSlot;
      }
    }
  }).filter(testSlot => testSlot);
};
