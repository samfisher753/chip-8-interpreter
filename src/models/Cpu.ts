import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../consts/Consts";
import { DecodedInstruction } from "../types/DecodedInstruction";
import Memory from "./Memory";
import Screen from "./Screen";
class Cpu {

  pc: number = 0x200;
  index: number = 0x0000;
  ips: number = 500;
  v: number[] = new Array(16).fill(0);
  
  memory: Memory;
  screen: Screen;

  intervalId: number | null = null;

  constructor(memory: Memory, screen: Screen) {
    this.memory = memory;
    this.screen = screen;
  }

  public start() {
    this.intervalId = setInterval(() => {
      const instruction: number = this.fetch();
      const decodedInstruction: DecodedInstruction = this.decode(instruction);
      this.execute(decodedInstruction);
    }, Math.floor(1000 / this.ips));
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private fetch(): number {
    const instruction: number = this.memory.read(this.pc);
    this.pc += 2;
    return instruction;
  }

  private decode(instruction: number): DecodedInstruction {
    const decodedInstruction: DecodedInstruction = {
      instruction: instruction,
      category: (instruction & 0xF000) >> 12,
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

  private execute(instruction: DecodedInstruction): void {
    switch (instruction.category) {
      case 0x0: // 0NNN
        switch (instruction.nnn) {
          case 0x0E0:
            // Clear the display
            this.screen.clear();
            break;
          case 0x0EE:
            // WIP: Return from subroutine
            console.log("WIP: Return from subroutine");
            break;
          default:
            // Call machine code routine at NNN
            // Not implemented in this example
            break;
        }
        break;

      case 0x1: // 1NNN
        // Jump to address NNN
        this.pc = instruction.nnn;
        break;
        
      case 0x6: // 6XNN
        // Set Vx to NN
        this.v[instruction.x] = instruction.nn;
        break;

      case 0x7: // 7XNN
        // Add NN to Vx
        this.v[instruction.x] = (this.v[instruction.x] + instruction.nn) & 0xFF;
        break;

      case 0xA: // ANNN
        // Set index register to NNN
        this.index = instruction.nnn;
        break;

      case 0xD: // DXYN
        // Draw sprite at coordinate (Vx, Vy) with height N
        console.log(`Draw sprite at (${this.v[instruction.x]}, ${this.v[instruction.y]}) with height ${instruction.n}`);
        this.draw(instruction);
        break;

      default:
        // Handle other instructions
        console.warn(`Unhandled instruction category: ${instruction.category}`);
    }
  }

  private draw(instruction: DecodedInstruction): void {
    const x: number = this.v[instruction.x] % SCREEN_WIDTH; // Wrap around screen width
    const y: number = this.v[instruction.y] % SCREEN_HEIGHT; // Wrap around screen height
    this.v[0xF] = 0; // Clear VF register for collision detection
    const height: number = instruction.n;

    for (let row = 0; row < height; row++) {
      const spriteByte: number = this.memory.readByte(this.index + row);
      const yDrawPos: number = y + row;
      if (yDrawPos >= SCREEN_HEIGHT) break;
      for (let col = 0; col < 8; col++) {
        const xDrawPos: number = x + col;
        if (xDrawPos >= SCREEN_WIDTH) break;
        const spritePixelOn = (spriteByte >> (7 - col)) & 1;
        if (spritePixelOn) {
          this.screen.pixel[yDrawPos][xDrawPos] = !this.screen.pixel[yDrawPos][xDrawPos];
          if (!this.screen.pixel[yDrawPos][xDrawPos]) {
            this.v[0xF] = 1; // Set VF to 1 if pixel was turned off (collision)
          }
        }
      }
    }

    this.screen.draw();
  }

}

export default Cpu;
