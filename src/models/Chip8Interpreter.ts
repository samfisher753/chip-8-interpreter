import Cpu from "./Cpu";
import Memory from "./Memory";
import Screen from "./Screen";

class Chip8Interpreter {

  cpu: Cpu | null = null;
  memory: Memory | null = null;
  screen: Screen;

  isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.screen = new Screen(canvas);
  }

  private initialize() {
    this.isRunning = true;
    this.memory = new Memory();
    this.cpu = new Cpu(this.memory, this.screen);
    this.screen!.clear();
  }

  public loadProgram(program: Uint8Array) {
    this.stop();
    this.initialize();
    this.memory!.loadProgram(program);
    this.cpu!.start();
  }

  public stop() {
    if (this.isRunning) {
      this.cpu!.stop();
      this.isRunning = false;
    }
  }

  public pause() {
    if (this.isRunning) {
      this.cpu!.pause();
    }
  }

  public resume() {
    if (this.isRunning) {
      this.cpu!.resume();
    }
  }

}

export default Chip8Interpreter;
