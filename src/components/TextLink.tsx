import React from 'react';

// Define the props for the TextLink component
interface TextLinkProps {
  url: string; // Prop for the href attribute of the link
  text: string; // Prop for the text content of the link
}

/**
 * TextLink Component
 *
 * This component renders an anchor tag (<a>) with a dynamic href and text content.
 * It opens the link in a new tab and includes accessibility best practices.
 * It uses Tailwind CSS for styling.
 *
 * @param {TextLinkProps} { link, text } - The URL for the link and the text to display.
 * @returns {JSX.Element} The TextLink component.
 */
const TextLink: React.FC<TextLinkProps> = ({ url, text }) => {
  return (
    <a
      href={url} // Dynamic href from the 'link' prop
      target="_blank" // Opens the link in a new tab
      rel="noopener noreferrer" // Security best practice for target="_blank"
      className="text-green-400 hover:underline" // Tailwind CSS classes for styling
    >
      {text} {/* Dynamic text content from the 'text' prop */}
    </a>
  );
};

export default TextLink;