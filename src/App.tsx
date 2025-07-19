import { useState, useRef, useEffect } from 'react';
import Card from './components/Card';
import KeysTable from './components/KeysTable';
import TextLink from './components/TextLink';
import Chip8Interpreter from './models/Chip8Interpreter';
import Button from './components/Button';
import type { InterpreterState } from './types/InterpreterState';

// Main App component for the CHIP-8 interpreter interface
const App = () => {
  // State to manage whether the interpreter is currently running
  const [interpreterState, setInterpreterState] = useState<InterpreterState>("STOPPED");
  const romFileRef = useRef<File>(null);
  // State to display messages to the user
  const [message, setMessage] = useState("Load a CHIP-8 ROM to begin!");
  // Ref for the file input element to programmatically click it
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State to control the visibility of the ROM selection dropdown
  const [showRomDropdown, setShowRomDropdown] = useState(false);
  // Ref for the canvas element to draw on it
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chip8Ref = useRef<Chip8Interpreter>(null);

  useEffect(() => {
    if (canvasRef.current && !chip8Ref.current) {
      const screen = canvasRef.current;
      chip8Ref.current = new Chip8Interpreter(screen);
    }

    return () => {
      if (chip8Ref.current) {
        chip8Ref.current.stop();
        chip8Ref.current = null;
      }
    };
  }, []);

  const loadRomFile = async () => {
    if (romFileRef.current) {
      const arrayBuffer = await romFileRef!.current.arrayBuffer();
      chip8Ref.current!.loadProgram(new Uint8Array(arrayBuffer));
      setInterpreterState("RUNNING");
      setMessage(`ROM "${romFileRef.current.name}" loaded!`);
    }
  }

  async function getRomFileFromServer(rom: any): Promise<File> {
    const url = `./roms/${rom.fileName}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the response as an ArrayBuffer (for binary data like ROMs)
    const arrayBuffer = await response.arrayBuffer();

    // If you need a File object (e.g., for APIs that specifically require it)
    // You can create one from the ArrayBuffer:
    const fileBlob = new Blob([arrayBuffer], { type: 'application/octet-stream' }); // Use appropriate MIME type
    return new File([fileBlob], rom.fileName);
  }

  // Handler for when a file is selected via the hidden input
  const handleFileChange = (event: any) => {
    romFileRef.current = event.target.files[0]; // Get the first selected file
    loadRomFile();
    // Reset the file input value to allow selecting the same file again
    event.target.value = null;
    setShowRomDropdown(false); // Close dropdown after selection
  };

  // Handler for selecting a predefined ROM from the dropdown
  const handleSelectRom = async (rom: any) => {
    if (rom.name === "Custom") {
      fileInputRef.current!.click(); // Open file selector for custom ROM
    } else {
      try {
        romFileRef.current = await getRomFileFromServer(rom);
        loadRomFile();
      } catch (error) {
        console.error("Error loading ROM:", error);
        setMessage("Failed to load ROM. Please try again.");
      }
    }
    setShowRomDropdown(false); // Close dropdown after selection
  };

  // Handler for the "Stop Interpreter" button click
  const handleStopInterpreter = () => {
    if (interpreterState == "RUNNING" || interpreterState == "PAUSED") {
      chip8Ref.current!.stop();
      setInterpreterState("STOPPED"); // Update interpreter state
      setMessage("Interpreter stopped. Load another ROM?"); // Update message
    } else {
      setMessage("Interpreter is not running."); // Inform user if already stopped
    }
  };

  // Handler for the "Pause/Resume Interpreter" button click
  const handleTogglePauseResume = () => {
    if (interpreterState == "RUNNING") {
      chip8Ref.current!.pause();
      setInterpreterState("PAUSED");
      setMessage("Interpreter Paused.");
    } else if (interpreterState == "PAUSED") {
      chip8Ref.current!.resume();
      setInterpreterState("RUNNING");
      setMessage("Interpreter Resumed.");
    } else if (romFileRef.current) {
      loadRomFile();
      setInterpreterState("RUNNING");
      setMessage("Interpreter Started.");
    }
  };

  // Data for CHIP-8 original keys and modern keyboard mapping
  const chip8Keys = [
    ['1', '2', '3', 'C'],
    ['4', '5', '6', 'D'],
    ['7', '8', '9', 'E'],
    ['A', '0', 'B', 'F']
  ];

  const modernKeys = [
    ['1', '2', '3', '4'],
    ['Q', 'W', 'E', 'R'],
    ['A', 'S', 'D', 'F'],
    ['Z', 'X', 'C', 'V']
  ];

  // Predefined ROMs for the dropdown
  const predefinedRoms = [
    { name: "TETRIS", fileName: "Tetris [Fran Dachille, 1991].ch8" },
    { name: "AIRPLANE", fileName: "Airplane.ch8" },
    { name: "PONG", fileName: "Pong (1 player).ch8" },
    { name: "SPACE INVADERS", fileName: "Space Invaders [David Winter].ch8" },
    { name: "IBM LOGO", fileName: "IBM Logo.ch8" },
    { name: "TEST OPCODE", fileName: "test_opcode.ch8" },
    { name: "Custom", fileName: null }
  ];

  const textLinks = [
    { text: "CHIP-8 on Wikipedia", url: "https://en.wikipedia.org/wiki/CHIP-8" },
    { text: "Guide to making a CHIP-8 emulator - Tobias V. Langhoff", url: "https://tobiasvl.github.io/blog/write-a-chip-8-emulator/" },
    { text: "My GitHub", url: "https://github.com/samfisher753" },
    { text: "Source Code", url: "https://github.com/samfisher753/chip-8-interpreter" }
  ];

  return (
    // Main container for the entire application
    <div className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-4 font-mono">
      {/* Link to Google Fonts for the retro console font */}
      <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />

      {/* Application Title */}
      <h1 className="text-5xl md:text-6xl font-bold mb-8 text-shadow-neon-green animate-pulse">
        CHIP-8 INTERPRETER
      </h1>

      {/* Interpreter Display Area (Canvas) */}
      <div className="w-[640px] h-[320px] bg-gray-900 border-4 border-green-500 rounded-lg shadow-lg overflow-hidden mb-8 aspect-video flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>

      {/* Current Status Message */}
      <p className="text-xl mb-6 text-center px-4">
        {message}
      </p>

      {/* Interpreter Control Buttons */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12 relative">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".ch8" // Suggest CHIP-8 ROM file extension
          className="hidden"
        />

        {/* Load ROM Dropdown Button */}
        <div className="relative">
          <Button
            onClick={() => setShowRomDropdown(!showRomDropdown)}
            color="green"
          >
            Load ROM
          </Button>
          {showRomDropdown && (
            <div className="absolute z-10 mt-2 w-full sm:w-48 bg-gray-800 rounded-md shadow-lg border border-green-600 overflow-hidden">
              {predefinedRoms.map((rom) => (
                <button
                  key={rom.name}
                  onClick={() => handleSelectRom(rom)}
                  className="block w-full text-left px-4 py-2 text-green-300 hover:bg-green-700 hover:text-white transition duration-200"
                >
                  {rom.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pause/Resume Interpreter Button */}
        <Button
          onClick={handleTogglePauseResume}
          color="blue"
          disabled={!romFileRef.current} // Disable if no ROM is loaded
        >
          {interpreterState == "RUNNING" ? 'Pause' : interpreterState == "PAUSED" ? 'Resume' : 'Start'}
        </Button>

        {/* Stop Interpreter Button */}
        <Button
          onClick={handleStopInterpreter}
          color="red"
          disabled={interpreterState == "STOPPED"} // Disable if interpreter is not running
        >
          Stop
        </Button>
      </div>

      {/* About CHIP-8 Section */}
      <Card title="What is CHIP-8?">
        <p className="text-lg leading-relaxed">
          CHIP-8 is an interpreted programming language, developed by Joseph Weisbecker in 1977,
          for the COSMAC VIP and Telmac 1800 microcomputers. It was designed to make game
          programming easier on these early 8-bit home computers. Many classic video games
          were written for CHIP-8, and its simplicity makes it a popular target for learning
          about virtual machines and retro computing.
        </p>
      </Card>

      {/* Controls Section */}
      <Card title="Controls">
        <p className="text-lg mb-4">
          The original CHIP-8 keypad had 16 hexadecimal keys. Here's how they map to a modern QWERTY keyboard:
        </p>
        <div className="flex flex-col md:flex-row justify-around items-start md:items-start space-y-8 md:space-y-0 md:space-x-8">
          {/* Original CHIP-8 Keypad Table */}
          <KeysTable title="Original Keypad" keys={chip8Keys} />

          {/* Modern Keyboard Mapping Table */}
          <KeysTable title="Modern Keyboard" keys={modernKeys} />
        </div>
      </Card>

      {/* Links Section */}
      <Card title="Useful Links">
        <ul className="list-disc list-inside mt-4 text-lg space-y-2">
          {
            textLinks.map((link, index) => (
              <li key={index}>
                <TextLink url={link.url} text={link.text} />
              </li>
            ))
          }
        </ul>
      </Card>

      {/* Footer or additional info */}
      <div className="mt-12 text-gray-600 text-sm">
        <p>&copy; 2025 CHIP-8 Interpreter. All rights reserved.</p>
      </div>
    </div>
  );
};

export default App;
