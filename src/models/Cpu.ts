import { DecodedInstruction } from "../types/DecodedInstruction";
import Memory from "./Memory";

class Cpu {

  pc: number = 0x200;
  index: number = 0x0000;
  ips: number = 500;
  v: number[] = new Array(16).fill(0);
  
  memory: Memory | null = null;

  intervalId: number | null = null;

  public setMemory(memory: Memory) {
    this.memory = memory; 
  }

  public start() {
    this.intervalId = setInterval(() => {
      const instruction: number = this.fetch();
      console.log(instruction);
      const decodedInstruction: DecodedInstruction = this.decode(instruction);
      console.log(decodedInstruction);
      // this.execute();
    }, Math.floor(1000 / this.ips));
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private fetch(): number {
    const instruction: number = this.memory!.read(this.pc);
    this.pc += 2;
    return instruction;
  }

  private decode(instruction: number): DecodedInstruction {
    const decodedInstruction: DecodedInstruction = {
      instruction: instruction,
      x: (instruction & 0x0F00) >> 8,
      y: (instruction & 0x00F0) >> 4,
      n: instruction & 0x000F,
      nn: instruction & 0x00FF,
      nnn: instruction & 0x0FFF,
      vx: this.v[(instruction & 0x0F00) >> 8],
      vy: this.v[(instruction & 0x00F0) >> 4]
    };
    return decodedInstruction;
  }

  private execute(): string {
    return "";
  }

}

export default Cpu;
