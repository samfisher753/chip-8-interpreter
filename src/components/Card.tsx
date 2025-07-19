import React from 'react';

// Define the props for the Card component
interface CardProps {
  title: string; // New prop for the H2 title
  children: React.ReactNode; // This prop will hold the content passed to the Card
}

/**
 * Card Component
 *
 * This component displays a styled card with a dynamic title and dynamic content.
 * It uses Tailwind CSS for styling.
 *
 * @param {CardProps} { title, children } - The title for the card and the content to be rendered inside.
 * @returns {JSX.Element} The Card component.
 */
const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <section className="w-full max-w-2xl p-6 bg-gray-900 border-4 border-green-500 rounded-lg shadow-lg mb-8">
      {/* The H2 title is now dynamic, passed via the 'title' prop */}
      <h2 className="text-3xl font-bold mb-4 text-shadow-neon-green">{title}</h2>
      {/* The children prop will render any content passed to this component */}
      {children}
    </section>
  );
};

export default Card;