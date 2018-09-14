import { Progress } from 'clui';
import ora from 'ora';
import truncate from 'truncate';
import colors from 'colors/safe';

export async function spin(label, promise) {
  const spinner = ora(label).start();
  const result = await promise;
  spinner.succeed();
  return result;
}

export function progress(label, max) {
  if (max === 0) {
    return () => {};
  }

  const spinner = ora(label).start();
  const prog = new Progress(30);
  let i = 0;

  const tick = async (info, promise) => {
    const newInfo = info.length > 0
      ? colors.grey(` — ${truncate(info, 25)}`) : info;

    spinner.text = `${label} (${i}/${max}) ${prog.update(i, max)} ${newInfo}`;

    const result = await promise;

    i += 1;
    spinner.text = `${label} (${i}/${max}) ${prog.update(i, max)} ${newInfo}`;

    if (i === max) {
      spinner.text = `${label} (${i}/${max}) ${prog.update(i, max)}`;
      spinner.succeed();
    }
    return result;
  };

  return tick;
}
