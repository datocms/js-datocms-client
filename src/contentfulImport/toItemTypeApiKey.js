export default value => {
  return `${value.toLowerCase().replace(/\d+/, '')}_model`;
};