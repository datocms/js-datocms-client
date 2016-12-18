import requireToken from '../dump/requireToken';

export default function () {
  const token = process.env.DATO_API_TOKEN;

  if (token) {
    process.exit();
    return;
  }

  requireToken().then(() => process.exit());
}
