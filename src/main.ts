import Chip8Interpreter from "./models/Chip8Interpreter";

const chip8 = new Chip8Interpreter();
const fileInput = document.getElementById('file') as HTMLInputElement;
let file: File | null = null;

fileInput.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement;
  file = target.files!.item(0);
  const arrayBuffer = await file!.arrayBuffer();
  chip8.loadProgram(new Uint8Array(arrayBuffer));
});

const stopButton = document.getElementById('stop') as HTMLButtonElement;
stopButton.addEventListener('click', () => {
  chip8.stop();
});


/*
import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div>
  <a href="https://vite.dev" target="_blank">
    <img src="${viteLogo}" class="logo" alt="Vite logo" />
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
  </a>
  <h1>Vite + TypeScript</h1>
  <div class="card">
    <button id="counter" type="button"></button>
  </div>
  <p class="read-the-docs">
    Click on the Vite and TypeScript logos to learn more
  </p>
</div>
`


<div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

*/
