import Cpu from "./Cpu";
import Memory from "./Memory";
import Screen from "./Screen";

class Chip8Interpreter {

  cpu: Cpu;
  memory: Memory;
  screen: Screen;

  constructor(canvas: HTMLCanvasElement) {
    this.memory = new Memory();
    this.screen = new Screen(canvas);
    this.cpu = new Cpu(this.memory, this.screen);
  }

  loadProgram(program: Uint8Array) {
    this.memory.loadProgram(program);
    this.cpu.start();
  }

  stop() {
    this.cpu.stop();
  }

}

export default Chip8Interpreter;
