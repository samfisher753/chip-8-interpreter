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

  initialize() {
    this.isRunning = true;
    this.memory = new Memory();
    this.cpu = new Cpu(this.memory, this.screen);
    this.screen!.clear();
  }

  loadProgram(program: Uint8Array) {
    this.stop();
    this.initialize();
    this.memory!.loadProgram(program);
    this.cpu!.start();
  }

  stop() {
    if (this.isRunning) {
      this.cpu!.stop();
      this.screen!.clear();
      this.isRunning = false;
    }
  }

}

export default Chip8Interpreter;
