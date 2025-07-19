import { CPU_IPS, FONT_BASE_ADDRESS, PROGRAM_START_ADDRESS, SCREEN_HEIGHT, SCREEN_WIDTH, TIMERS_HZS } from "../consts/Consts";
import { beep, getFirstKeyDownValue, isKeyDown } from "../utils/Utils";
import type { DecodedInstruction } from "../types/DecodedInstruction";
import Memory from "./Memory";
import Screen from "./Screen";
class Cpu {

  pc: number = PROGRAM_START_ADDRESS;
  index: number = 0x0000;
  v: number[] = new Array(16).fill(0);
  stack: number[] = [];
  delayTimer: number = 0;
  soundTimer: number = 0;
  
  memory: Memory;
  screen: Screen;

  cpuIntervalId: number | null = null;
  delayTimerIntervalId: number | null = null;
  soundTimerIntervalId: number | null = null;

  constructor(memory: Memory, screen: Screen) {
    this.memory = memory;
    this.screen = screen;
  }

  public start() {
    this.cpuIntervalId = setInterval(() => {
      const instruction: number = this.fetch();
      const decodedInstruction: DecodedInstruction = this.decode(instruction);
      this.execute(decodedInstruction);
    }, Math.floor(1000 / CPU_IPS));
  }

  public stop() {
    if (this.cpuIntervalId) {
      clearInterval(this.cpuIntervalId);
    }
    if (this.delayTimerIntervalId) {
      clearInterval(this.delayTimerIntervalId);
    }
    if (this.soundTimerIntervalId) {
      clearInterval(this.soundTimerIntervalId);
    }
  }

  public pause() {
    if (this.cpuIntervalId) {
      clearInterval(this.cpuIntervalId);
      this.cpuIntervalId = null;
    }
  }

  public resume() {
    if (!this.cpuIntervalId) {
      this.start();
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
            // Return from subroutine
            if (this.stack.length > 0) {
              this.pc = this.stack.shift()!;
            } else {
              console.warn("Stack underflow on return from subroutine");
            }
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

      case 0x2: // 2NNN
        // Call subroutine at NNN
        this.stack.unshift(this.pc);
        this.pc = instruction.nnn;
        break;

      case 0x3: // 3XNN
        // Skip next instruction if Vx equals NN
        if (this.v[instruction.x] === instruction.nn) {
          this.pc += 2;
        }
        break;

      case 0x4: // 4XNN
        // Skip next instruction if Vx does not equal NN
        if (this.v[instruction.x] !== instruction.nn) {
          this.pc += 2;
        }
        break;

      case 0x5: // 5XY0
        // Skip next instruction if Vx equals Vy
        if (this.v[instruction.x] === this.v[instruction.y]) {
          this.pc += 2;
        }
        break;

      case 0x9: // 9XY0
        // Skip next instruction if Vx does not equal Vy
        if (this.v[instruction.x] !== this.v[instruction.y]) {
          this.pc += 2;
        }
        break;
        
      case 0x6: // 6XNN
        // Set Vx to NN
        this.v[instruction.x] = instruction.nn;
        break;

      case 0x7: // 7XNN
        // Add NN to Vx
        this.v[instruction.x] = (this.v[instruction.x] + instruction.nn) & 0xFF;
        break;

      case 0x8: // 8XYN
        switch (instruction.n) {
          case 0x0:
            // Set Vx to Vy
            this.v[instruction.x] = this.v[instruction.y];
            break;
          case 0x1:
            // Set Vx to Vx OR Vy
            this.v[instruction.x] |= this.v[instruction.y];
            break;
          case 0x2:
            // Set Vx to Vx AND Vy
            this.v[instruction.x] &= this.v[instruction.y];
            break;
          case 0x3:
            // Set Vx to Vx XOR Vy
            this.v[instruction.x] ^= this.v[instruction.y];
            break;
          case 0x4:
            // Add Vy to Vx, set VF to 1 if carry, 0 otherwise
            const sum = this.v[instruction.x] + this.v[instruction.y];
            this.v[0xF] = sum > 0xFF ? 1 : 0; // Set VF to 1 if carry
            this.v[instruction.x] = sum & 0xFF; // Keep only the lower 8 bits
            break;
          case 0x5:
            // Subtract Vy from Vx, set VF to 0 if borrow, 1 otherwise
            this.v[0xF] = this.v[instruction.x] >= this.v[instruction.y] ? 1 : 0; // Set VF to 1 if no borrow
            this.v[instruction.x] = (this.v[instruction.x] - this.v[instruction.y]) & 0xFF; // Keep only the lower 8 bits
            break
          case 0x7:
            // Set Vx to Vy - Vx, set VF to 0 if borrow, 1 otherwise
            this.v[0xF] = this.v[instruction.y] >= this.v[instruction.x] ? 1 : 0; // Set VF to 1 if no borrow
            this.v[instruction.x] = (this.v[instruction.y] - this.v[instruction.x]) & 0xFF; // Keep only the lower 8 bits
            break;
          case 0x6: // Shift Vx right by 1, set VF to the least significant bit before shift
            // AMBIGUOUS: In the original COSMAC VIP interpreter, it first copies Vy to Vx, but later versions don't do this
            // We don't do it
            this.v[0xF] = this.v[instruction.x] & 0x1;
            this.v[instruction.x] = (this.v[instruction.x] >> 1) & 0xFF; // Keep only the lower 8 bits
            break;
          case 0xE: // Shift Vx left by 1, set VF to the most significant bit before shift
            // AMBIGUOUS: In the original COSMAC VIP interpreter, it first copies Vy to Vx, but later versions don't do this
            // We don't do it
            this.v[0xF] = (this.v[instruction.x] & 0x80) >> 7;
            this.v[instruction.x] = (this.v[instruction.x] << 1) & 0xFF; // Keep only the lower 8 bits
            break;
        }
        break;

      case 0xA: // ANNN
        // Set index register to NNN
        this.index = instruction.nnn;
        break;

      case 0xB: // BNNN
        // AMBIGUOUS: In the original COSMAC VIP interpreter, it jumps to NNN + V0, but later versions do it differently
        // We do it like the original COSMAC VIP interpreter
        // Jump to address NNN + V0
        this.pc = instruction.nnn + this.v[0];
        break;

      case 0xC: // CXNN
        // Set Vx to a random number AND NN
        this.v[instruction.x] = Math.floor(Math.random() * 256) & instruction.nn;
        break;

      case 0xD: // DXYN
        // Draw sprite at coordinate (Vx, Vy) with height N
        // console.log(`Draw sprite at (${this.v[instruction.x]}, ${this.v[instruction.y]}) with height ${instruction.n}`);
        this.draw(instruction);
        break;

      case 0xE: // EXNN
        switch (instruction.nn) {
          case 0x9E: // Skip next instruction if key Vx is pressed
            if (isKeyDown(this.v[instruction.x])) {
              this.pc += 2;
            }
            break;
          case 0xA1: // Skip next instruction if key Vx is not pressed
            if (!isKeyDown(this.v[instruction.x])) {
              this.pc += 2;
            }
            break;
        }
        break;

      case 0xF: // FXNN
        switch (instruction.nn) {
          case 0x07: // Set Vx to the value of the delay timer
            this.v[instruction.x] = this.delayTimer;
            break;
          case 0x15: // Set the delay timer to Vx
            this.delayTimer = this.v[instruction.x];
            if (this.delayTimer > 0 && !this.delayTimerIntervalId) {
              this.delayTimerIntervalId = setInterval(() => {
                if (this.delayTimer > 0) {
                  this.delayTimer--;
                } else {
                  clearInterval(this.delayTimerIntervalId!);
                  this.delayTimerIntervalId = null;
                }
              }, Math.floor(1000 / TIMERS_HZS));
            }
            break;
          case 0x18: // Set the sound timer to Vx
            this.soundTimer = this.v[instruction.x];
            if (this.soundTimer > 0 && !this.soundTimerIntervalId) {
              this.soundTimerIntervalId = setInterval(() => {
                if (this.soundTimer > 0) {
                  beep();
                  this.soundTimer--;
                } else {
                  clearInterval(this.soundTimerIntervalId!);
                  this.soundTimerIntervalId = null;
                }
              }, Math.floor(1000 / TIMERS_HZS));
            }
            break;
          case 0x1E: // Add Vx to index register
            this.v[0xF] = (this.index + this.v[instruction.x]) > 0xFFF ? 1 : 0; // Set VF to 1 if overflow
            this.index = (this.index + this.v[instruction.x]) & 0xFFF;
            break;
          case 0x0A: // Wait for a key press and store it in Vx
            const keyValue = getFirstKeyDownValue();
            if (keyValue !== null) {
              this.v[instruction.x] = keyValue;
            } else {
              // If no key is pressed, we don't increment the PC
              this.pc -= 2; // Revert the PC increment to wait for a key press
            }
            break;
          case 0x29: // Set index register to the location of the sprite for digit Vx
            this.index = FONT_BASE_ADDRESS + (this.v[instruction.x] * 5);
            break;
          case 0x33: // Store BCD representation of Vx in memory at index
            const value = this.v[instruction.x];
            this.memory.writeByte(this.index, Math.floor(value / 100));
            this.memory.writeByte(this.index + 1, Math.floor((value % 100) / 10));
            this.memory.writeByte(this.index + 2, value % 10);
            break;
          case 0x55: // Store registers V0 to Vx in memory starting at index
            // AMBIGUOUS: In the original COSMAC VIP interpreter, the value of index is incremented, but later versions do not increment it
            // We don't increment the index here
            for (let i = 0; i <= instruction.x; i++) {
              this.memory.writeByte(this.index + i, this.v[i]);
            }
            break;
          case 0x65: // Read registers V0 to Vx from memory starting at index
            // AMBIGUOUS: In the original COSMAC VIP interpreter, the value of index is incremented, but later versions do not increment it
            // We don't increment the index here
            for (let i = 0; i <= instruction.x; i++) {
              this.v[i] = this.memory.readByte(this.index + i);
            }
            break;
        }
        break;

      default:
        // Handle other instructions
        console.warn(`Unhandled instruction category: ${instruction.category}`);
        console.warn(`Instruction: `, instruction);
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
