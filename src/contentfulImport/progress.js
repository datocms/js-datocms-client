import { Progress } from 'clui';

export default function(size, text) {
  let currentValue = 0;
  let currentText = text;
  const progress = new Progress(30);

  this.tick = () => {
    currentValue += 1;
    const progressText = progress.update(currentValue / size);
    return `${currentText.padEnd(70, ' ')}${progressText}`;
  };

  this.changeText = newText => {
    currentText = newText;
    const progressText = progress.update(currentValue / size);
    return `${currentText.padEnd(70, ' ')}${progressText}`;
  };
}
