import requireToken from '../dump/requireToken';

export default async function() {
  const token = process.env.DATO_API_TOKEN;

  if (token) {
    return undefined;
  }

  return requireToken();
}
