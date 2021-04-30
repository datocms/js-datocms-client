const datoValidatorsForString = ({ field }) => {
  const validators = {};

  if (field.required) {
    validators.required = {};
  }

  for (const validation of field.validations) {
    if (Object.prototype.hasOwnProperty.call(validation, 'size')) {
      validators.length = {};
      if (validation.size.min && validation.size.min === validation.size.max) {
        validators.length.eq = validation.size.min.toString();
      } else {
        if (![null, undefined].includes(validation.size.min)) {
          validators.length.min = validation.size.min.toString();
        }
        if (![null, undefined].includes(validation.size.max)) {
          validators.length.max = validation.size.max.toString();
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(validation, 'unique')) {
      validators.unique = {};
    }

    if (Object.prototype.hasOwnProperty.call(validation, 'in')) {
      validators.enum = {
        values: validation.in,
      };
    }
    if (Object.prototype.hasOwnProperty.call(validation, 'regexp')) {
      validators.format = {
        customPattern: validation.regexp.pattern,
      };
    }
  }

  return validators;
};

const datoValidatorsForInteger = ({ field }) => {
  const validators = {};

  if (field.required) {
    validators.required = {};
  }

  for (const validation of field.validations) {
    if (Object.prototype.hasOwnProperty.call(validation, 'range')) {
      validators.numberRange = {};
      if (![null, undefined].includes(validation.range.min)) {
        validators.numberRange.min = validation.range.min.toString();
      }
      if (![null, undefined].includes(validation.range.max)) {
        validators.numberRange.max = validation.range.max.toString();
      }
    }
  }

  return validators;
};

const datoValidatorsForDate = ({ field }) => {
  const validators = {};

  if (field.required) {
    validators.required = {};
  }

  for (const validation of field.validations) {
    if (Object.prototype.hasOwnProperty.call(validation, 'dateRange')) {
      validators.dateRange = {
        min: validation.dateRange.min,
        max: validation.dateRange.max,
      };
    }
  }
  return validators;
};

const datoValidatorsForAsset = ({ field }) => {
  const validators = {};

  if (field.required) {
    validators.required = {};
  }

  for (const validation of field.validations) {
    if (Object.prototype.hasOwnProperty.call(validation, 'assetFileSize')) {
      if (
        Object.prototype.hasOwnProperty.call(validation.assetFileSize, 'min')
      ) {
        validators.file_size = {
          ...validators.file_size,
          min_value: validation.assetFileSize.min,
          min_unit: validation.assetFileSize.min ? 'B' : null,
        };
      }
      if (
        Object.prototype.hasOwnProperty.call(validation.assetFileSize, 'max')
      ) {
        validators.file_size = {
          ...validators.file_size,
          max_value: validation.assetFileSize.max,
          max_unit: validation.assetFileSize.max ? 'B' : null,
        };
      }
    }
  }
  return validators;
};

const datoValidatorsForArray = ({ field }) => {
  const validators = {};

  for (const validation of field.validations) {
    if (Object.prototype.hasOwnProperty.call(validation, 'size')) {
      validators.size = {};
      if (validation.size.min && validation.size.min === validation.size.max) {
        validators.size.eq = validation.size.min.toString();
      } else {
        if (![null, undefined].includes(validation.size.min)) {
          validators.size.min = validation.size.min.toString();
        }
        if (![null, undefined].includes(validation.size.max)) {
          validators.size.max = validation.size.max.toString();
        }
      }
    }
  }

  return validators;
};

export default function createFields(field) {
  switch (field.type) {
    case 'Symbol':
    case 'Text':
      return datoValidatorsForString({ field });
    case 'Date':
      return datoValidatorsForDate({ field });
    case 'Integer':
    case 'Number':
      return datoValidatorsForInteger({ field });
    case 'Link':
      switch (field.linkType) {
        case 'Asset':
          return datoValidatorsForAsset({ field });
        default:
          return {};
      }
    case 'Array':
      switch (field.items.linkType) {
        case 'Asset':
        case 'Entry':
          return datoValidatorsForArray({ field });
        case 'Symbol':
          return datoValidatorsForString({ field });
        default:
          return datoValidatorsForString({ field });
      }
    case 'Boolean':
    default:
      return {};
  }
}
