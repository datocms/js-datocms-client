import { Progress } from 'clui';

export default function (size, text) {
  let currentValue = 0;
  const progress = new Progress(size);

  this.tick = () => {
    const progressText = progress.update(currentValue += 1, size);
    return `${text} ${progressText}`;
  };
}
