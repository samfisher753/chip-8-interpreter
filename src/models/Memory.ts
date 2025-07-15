import { FONT, FONT_BASE_ADDRESS, MEMORY_SIZE, PROGRAM_START_ADDRESS } from "../consts/Consts";

class Memory {

  memory: Uint8Array;

  constructor() {
    this.memory = new Uint8Array(MEMORY_SIZE);

    for (let i = 0; i < FONT.length; ++i) {
      this.memory[FONT_BASE_ADDRESS + i] = FONT[i];
    }
  }

  loadProgram(program: Uint8Array) {
    for (let i = 0; i < program.length; ++i) {
      this.checkAddress(PROGRAM_START_ADDRESS + i);
      this.memory[PROGRAM_START_ADDRESS + i] = program[i];
    }
  }

  read(address: number): number {
    this.checkAddress(address);
    this.checkAddress(address+1);
    return (this.memory[address] << 8) + this.memory[address+1];
  }

  readByte(address: number): number {
    this.checkAddress(address);
    return this.memory[address];
  }

  writeByte(address: number, value: number) {
    this.checkAddress(address);
    this.memory[address] = value & 0xFF; // Ensure value is a byte
  }

  private checkAddress(address: number) {
    if (address < 0 || address >= MEMORY_SIZE) {
      throw new Error(`Memory access out of bounds: ${address}`);
    }
  }

}

export default Memory;