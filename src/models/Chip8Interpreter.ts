import Cpu from "./Cpu";
import Memory from "./Memory";

class Chip8Interpreter {

  cpu: Cpu;
  memory: Memory;

  constructor() {
    this.cpu = new Cpu();
    this.memory = new Memory();
    this.cpu.setMemory(this.memory);
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
