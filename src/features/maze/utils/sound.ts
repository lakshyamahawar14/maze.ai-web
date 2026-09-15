class MoveSoundManager {
  private primaryAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.primaryAudio = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3");
      this.primaryAudio.preload = "auto";
      this.primaryAudio.volume = 1.0;
    }
  }

  public playMoveSound() {
    if (!this.primaryAudio) return;

    this.primaryAudio.currentTime = 0;
    const playPromise = this.primaryAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }
}

export const soundManager = new MoveSoundManager();