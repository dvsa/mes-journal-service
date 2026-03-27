import { formatApplicationReference } from '@dvsa/mes-microservice-common/domain/tars';
import { TestSlot } from '@dvsa/mes-journal-schema';

/**
 * Sanitises the input string by removing all non-alphanumeric characters and converting it to uppercase.
 * @param input
 */
const sanitiseAppRef = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

/**
 * Formats the test slots by filtering them based on the provided application reference.
 * It compares the booking reference from the DSP data (if available) or formats the TARS data
 * into a string, against the provided application reference after sanitising both.
 * @param testSlots
 * @param parameterAppRef
 */
export const formatTestSlots = (testSlots: TestSlot[] = [], parameterAppRef: string) => {

  return testSlots.filter((slot) => {
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

    return sanitiseAppRef(formattedSlotAppRef) === sanitiseAppRef(parameterAppRef);
  });
};
