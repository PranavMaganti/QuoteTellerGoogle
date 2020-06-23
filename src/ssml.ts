export enum Rate {
  XSLOW = 'x-slow',
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast',
  XFAST = 'x-fast',
  DEFAULT = 'default',
  NONE = 'none'
}

/** Class to build a SSML text response */
export class SSML {
  ssml: string;
  /**
   * Creates ssml string
   */
  constructor() {
    this.ssml = '';
  }

  /**
   * Adds text to the ssml string
   * @param { string } text the text to be added
   */
  speak(text: string): void {
    this.addSpace();
    this.ssml += text;
  }

  /**
   * Adds break tag to the ssml string
   * @param { string } time the amount of time to break for. Follows standard
   * SSML time style
   */
  break(time: string): void {
    this.addSpace();
    this.ssml += '<break time = \'' + time + '\'/>';
  }

  /**
   * Adds prosody tag to change the speed and pitch of the speech
   * @param { string } text the text to be spoken
   * @param { Rate } rate the rate at which the text should be spoken
   * @param { string } pitch the pitch at which the text should be spoken
   */
  prosody(text: string, rate: Rate = Rate.NONE, pitch = ''): void {
    this.addSpace();
    this.ssml += '<prosody';
    if (rate != Rate.NONE) {
      this.ssml += ' rate=\'' + rate + '\'';
    }
    if (pitch != '') {
      this.ssml += ' pitch=\'' + pitch + '\'';
    }

    this.ssml += '>';
    this.ssml += text;
    this.ssml += '</prosody>';
  }

  /**
   * Adds a start paragraph tag to ssml string
   */
  startParagraph(): void {
    this.addSpace();
    this.ssml += '<p>';
  }

  /**
   * Adds a end paragraph tag to ssml string
   */
  endParagraph(): void {
    this.addSpace();
    this.ssml += '</p>';
  }

  /**
   * Adds space if the last character was punctuation
   */
  private addSpace(): void {
    if (this.ssml.match(/$[.,:!?]/)) {
      this.ssml += ' ';
    }
  }

  /**
   * Return the ssml response string
   * @return { string } the ssml formatted response
   */
  public toString(): string {
    return '<speak>' + this.ssml + '</speak>';
  }
}
