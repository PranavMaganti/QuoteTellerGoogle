export enum Rate {
  XSLOW = "x-slow",
  SLOW = "slow",
  MEDIUM = "medium",
  FAST = "fast",
  XFAST = "x-fast",
  DEFAULT = "default",
  NONE = "none"
}

export class SSML {
  ssml: string;
  constructor() {
    this.ssml = "";
  }

  speak(text: string) {
    this.addSpace();
    this.ssml += text;
  }

  break(time: string) {
    this.addSpace();
    this.ssml += "<break time = '" + time + "'/>"
  }

  prosody(text: string, rate: Rate = Rate.NONE, pitch: string = "") {
    this.addSpace();
    this.ssml += "<prosody"
    if (rate != Rate.NONE) {
      this.ssml += " rate='" + rate + "'";
    }
    if (pitch != "") {
      this.ssml += " pitch='" + pitch + "'"
    }

    this.ssml += ">"
    this.ssml += text;
    this.ssml += "</prosody>"
  }

  startParagraph() {
    this.addSpace();
    this.ssml += "<p>"
  }

  endParagraph() {
    this.addSpace();
    this.ssml += "</p>"
  }

  /**
   * Adds space if the last character was punctuation
   */
  private addSpace() {
    if (this.ssml.match(/$[.,:!?]/)) {
      this.ssml += " ";
    }
  }

  public toString = (): string => {
    return "<speak>" + this.ssml + "</speak>";
  }
}