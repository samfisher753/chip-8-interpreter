import Memory from "./Memory";

class Cpu {

  pc: number = 0x200;
  index: number = 0x0000;
  ips: number = 500;
  
  memory: Memory | null = null;

  intervalId: number | null = null;

  public setMemory(memory: Memory) {
    this.memory = memory; 
  }

  public start() {
    this.intervalId = setInterval(() => {
      const instruction: number = this.fetch();
      console.log(instruction);
      // this.decode();
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

  private decode(): string {
    return "";
  }

  private execute(): string {
    return "";
  }

}

export default Cpu;
