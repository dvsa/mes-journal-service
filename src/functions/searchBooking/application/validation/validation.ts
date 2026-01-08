import * as joi from 'joi';

export class BookingValidator {
  private static schema = joi.object().keys({
    staffNumberValidator: joi.number().max(100000000).optional(),
    appRefValidator: joi.string().optional(),
  });

  constructor(
    private staffNumber: string,
    private applicationReference: string,
  ) {}

  isValid = () => BookingValidator.schema.validate({
    staffNumberValidator: this.staffNumber,
    appRefValidator: this.applicationReference,
  });
}
