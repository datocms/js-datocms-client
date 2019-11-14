export default function decode(url) {
  return decodeURIComponent(url) === url ? encodeURI(url) : url;
}
