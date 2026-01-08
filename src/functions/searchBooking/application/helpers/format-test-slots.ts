import {get} from 'lodash';
import {ApplicationReference} from '@dvsa/mes-test-schema/categories/common';
import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {TestSlot} from '@dvsa/mes-journal-schema';

export const formatTestSlots = (testSlots: TestSlot[] = [], parameterAppRef: string) => {
  return testSlots.map((testSlot) => {
    if (get(testSlot, 'booking.application', null)) {
      const application = get(testSlot, 'booking.application', null);

      let currentAppRef: string | ApplicationReference | undefined = '';

      // If the application has a bookingReference, use that as the test is from DSP
      if (get(application, 'bookingReference')) {
        currentAppRef = application?.bookingReference;
      } else {
        // Otherwise, set up the application reference object for TARS formatting
        currentAppRef = {
          applicationId: application?.applicationId || 0,
          checkDigit: application?.checkDigit || 0,
          bookingSequence: application?.bookingSequence || 0,
        };
      }

      // Transform the application reference into the correct format if needed.
      let formattedSlotAppRef: string =  '';

      switch (typeof currentAppRef) {
      case 'string':
        formattedSlotAppRef = currentAppRef;
        break;
      case 'object':
        formattedSlotAppRef = formatApplicationReference(currentAppRef).toString();
      }

      if (parameterAppRef === formattedSlotAppRef) {
        return testSlot;
      }
    }
  }).filter(testSlot => testSlot);
};
