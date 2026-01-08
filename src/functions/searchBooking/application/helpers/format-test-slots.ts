import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {TestSlot} from '@dvsa/mes-journal-schema';

export const formatTestSlots = (testSlots: TestSlot[] = [], parameterAppRef: string) =>
  testSlots.filter((slot) => {
    const application = slot?.booking?.application;
    if (!application) return false;

    // Use the DSP bookingReference field if it exists, otherwise format the TARS data into a string
    const formattedSlotAppRef =
          application.bookingReference ||
          formatApplicationReference({
            applicationId: application.applicationId || 0,
            checkDigit: application.checkDigit || 0,
            bookingSequence: application.bookingSequence || 0,
          }).toString();

    return formattedSlotAppRef === parameterAppRef;
  });
