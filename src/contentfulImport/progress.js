import { Progress } from 'clui';

export default function(size, text) {
  let currentValue = 0;
  const progress = new Progress(30);

  this.tick = () => {
    currentValue += 1;
    const progressText = progress.update(currentValue / size);
    return `${text.padEnd(70, ' ')}${progressText}`;
  };
}
