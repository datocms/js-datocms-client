export default async timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};
