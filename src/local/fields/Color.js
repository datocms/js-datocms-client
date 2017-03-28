export default class Color {
  constructor(value) {
    this.value = value;
  }

  get red() {
    return this.value.red;
  }

  get green() {
    return this.value.green;
  }

  get blue() {
    return this.value.blue;
  }

  get alpha() {
    return this.value.alpha / 255.0;
  }

  get rgb() {
    if (this.value.alpha === 255) {
      return `rgb(${this.red}, ${this.green}, ${this.blue})`;
    }

    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
  }

  get hex() {
    let hex = '#';

    let r = this.red.toString(16);
    let g = this.green.toString(16);
    let b = this.blue.toString(16);
    let a = parseInt(this.alpha * 255, 10).toString(16);

    if (r.length === 1) r = `0${r}`;
    if (g.length === 1) g = `0${g}`;
    if (b.length === 1) b = `0${b}`;
    if (a.length === 1) a = `0${a}`;

    hex += r + g + b;

    if (a !== 'ff') {
      hex += a;
    }

    return hex;
  }

  toMap() {
    return {
      red: this.red,
      green: this.green,
      blue: this.blue,
      rgb: this.rgb,
      hex: this.hex,
    };
  }
}
