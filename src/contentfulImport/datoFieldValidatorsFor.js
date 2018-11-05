import datoLinkItemTypeFor from './datoLinkItemTypeFor';

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
        if (validation.size.min) {
          validators.length.min = validation.size.min.toString();
        }
        if (validation.size.max) {
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
      if (validation.range.min) {
        validators.numberRange.min = validation.range.min.toString();
      }
      if (validation.range.max) {
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

const datoValidatorsForLocation = ({ field }) => {
  const validators = {};

  if (field.required) {
    validators.required = {};
  }
  return validators;
};

const datoValidatorsForObject = ({ field }) => {
  const validators = {};

  if (field.required) {
    validators.required = {};
  }
  return validators;
};

const datoValidatorsForLink = async ({ field, itemTypes }) => {
  const validators = {
    itemItemType: {
      itemTypes: datoLinkItemTypeFor({ field, itemTypes }),
    },
  };

  if (field.required) {
    validators.required = {};
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
      if (Object.prototype.hasOwnProperty.call(validation.assetFileSize, 'min')) {
        validators.file_size = {
          ...validators.file_size,
          min_value: validation.assetFileSize.min,
          min_unit: 'B',
        };
      }
      if (Object.prototype.hasOwnProperty.call(validation.assetFileSize, 'max')) {
        validators.file_size = {
          ...validators.file_size,
          max_value: validation.assetFileSize.max,
          max_unit: 'B',
        };
      }
    }
  }
  return validators;
};

const datoValidatorsForArray = async ({ field, itemTypes }) => {
  let validators = {};
  if (field.items.type === 'Link' && field.items.linkType === 'Entry') {
    validators = {
      itemsItemType: {
        itemTypes: datoLinkItemTypeFor({ field: field.items, itemTypes }),
      },
    };
  }

  for (const validation of field.validations) {
    if (Object.prototype.hasOwnProperty.call(validation, 'size')) {
      validators.size = {};
      if (validation.size.min && validation.size.min === validation.size.max) {
        validators.size.eq = validation.size.min.toString();
      } else {
        if (validation.size.min) {
          validators.size.min = validation.size.min.toString();
        }
        if (validation.size.max) {
          validators.size.max = validation.size.max.toString();
        }
      }
    }
  }
  return validators;
};

export default async ({ field, itemTypes }) => {
  switch (field.type) {
    case 'Symbol':
    case 'Text':
      return datoValidatorsForString({ field });
    case 'Integer':
    case 'Number':
      return datoValidatorsForInteger({ field });
    case 'Date':
      return datoValidatorsForDate({ field });
    case 'Location':
      return datoValidatorsForLocation({ field });
    case 'Object':
      return datoValidatorsForObject({ field });
    case 'Link':
      switch (field.linkType) {
        case 'Entry':
          return datoValidatorsForLink({ field, itemTypes });
        case 'Asset':
          return datoValidatorsForAsset({ field });
        default:
          return {};
      }
    case 'Array':
      return datoValidatorsForArray({ field, itemTypes });
    case 'Boolean':
    default:
      return {};
  }
};
