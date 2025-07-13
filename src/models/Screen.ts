import { PIXEL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from "../consts/Consts";

class Screen {

    canvas: HTMLCanvasElement;
    pixel: boolean[][];

    constructor(canvas: HTMLCanvasElement) {
        this.pixel = Array.from({ length: SCREEN_HEIGHT }, () => Array(SCREEN_WIDTH).fill(false));

        this.canvas = canvas;
        this.canvas.style.border = '1px solid black';
        this.canvas.width = SCREEN_WIDTH * PIXEL_SIZE;
        this.canvas.height = SCREEN_HEIGHT * PIXEL_SIZE;
    }

    clear() {
        this.pixel = Array.from({ length: SCREEN_HEIGHT }, () => Array(SCREEN_WIDTH).fill(false));
    }

    draw() {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let y = 0; y < SCREEN_HEIGHT; y++) {
                for (let x = 0; x < SCREEN_WIDTH; x++) {
                    if (this.pixel[y][x]) {
                        ctx.fillStyle = "white";
                    } else {
                        ctx.fillStyle = "black";
                    }
                    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
                }
            }
        }
    }

}

export default Screen;