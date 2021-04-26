export default field => {
  switch (field.type) {
    case 'Symbol':
      return 'string';
    case 'Text':
      return 'text';
    case 'Integer':
      return 'integer';
    case 'Number':
      return 'float';
    case 'Date':
      return 'date_time';
    case 'Location':
      return 'lat_lon';
    case 'Boolean':
      return 'boolean';
    case 'Object':
      return 'json';
    case 'RichText':
      return 'structured_text';
    case 'Link':
      switch (field.linkType) {
        case 'Entry':
          return 'link';
        case 'Asset':
          return 'file';
        default:
          return 'string';
      }
    case 'Array':
      switch (field.items.linkType) {
        case 'Asset':
          return 'gallery';
        case 'Entry':
          return 'links';
        case 'Symbol':
          return 'string';
        default:
          return 'string';
      }
    default:
      return 'string';
  }
};
