import {ApplicationReference} from '@dvsa/mes-test-schema/categories/common';

export const parseToAppRef = (applicationReference: string): ApplicationReference => ({
  applicationId: parseInt(
    applicationReference.substring(0, applicationReference.length - 3),
    10,
  ),
  checkDigit: parseInt(
    applicationReference.charAt(applicationReference.length - 1),
    10,
  ),
  bookingSequence: parseInt(
    applicationReference.substring(applicationReference.length - 3, applicationReference.length - 1),
    10,
  ),
});
