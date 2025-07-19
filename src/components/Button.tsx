import React from 'react';

// 1. Definimos el tipo para los colores permitidos
type ButtonColor = "green" | "blue" | "red";

// 2. Definimos la interfaz (o tipo) para las props del componente Button
interface ButtonProps {
  onClick: () => void; // Una función que no toma argumentos y no devuelve nada
  children: React.ReactNode; // El contenido del botón (texto, iconos, etc.)
  color?: ButtonColor; // Opcional, y debe ser uno de los colores definidos
  disabled?: boolean; // Opcional, un booleano
}

const Button: React.FC<ButtonProps> = ({ onClick, children, color = 'green', disabled = false }) => {
  const baseClasses = `
    px-8 py-4
    text-white text-xl font-bold
    rounded-lg
    border-2
    shadow-lg
    transition duration-300 ease-in-out
    transform hover:scale-105
    focus:outline-none focus:ring-4 focus:ring-opacity-75
    uppercase tracking-wide
    w-full sm:w-auto
  `;

  const activeColorClasses = {
    green: 'bg-green-700 hover:bg-green-600 border-green-500 shadow-green-900 focus:ring-green-500',
    blue: 'bg-blue-700 hover:bg-blue-600 border-blue-500 shadow-blue-900 focus:ring-blue-500',
    red: 'bg-red-700 hover:bg-red-600 border-red-500 shadow-red-900 focus:ring-red-500',
  };

  const disabledClasses = 'bg-gray-700 border-gray-500 shadow-gray-900 focus:ring-gray-500 cursor-not-allowed';

  const currentClasses = disabled
    ? disabledClasses
    : activeColorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${currentClasses}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;