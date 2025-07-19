import React from 'react';

// Define the props for the KeysTable component
interface KeysTableProps {
  title: string; // Prop for the H3 title
  keys: string[][]; // Prop for the 2D array of keys (e.g., string[4][4])
}

/**
 * KeysTable Component
 *
 * This component displays a table of keys with a dynamic title.
 * It expects a 2D array of strings for the 'keys' prop,
 * where each inner array represents a row in the table.
 * It uses Tailwind CSS for styling.
 *
 * @param {KeysTableProps} { title, keys } - The title for the table and the 2D array of keys.
 * @returns {JSX.Element} The KeysTable component.
 */
const KeysTable: React.FC<KeysTableProps> = ({ title, keys }) => {
  return (
    <div className="w-full md:w-1/2">
      {/* The H3 title is now dynamic, passed via the 'title' prop */}
      <h3 className="text-2xl font-bold mb-3 text-center text-green-300 whitespace-nowrap">{title}</h3>
      <table className="w-full text-center table-auto border-collapse border border-green-600">
        <tbody>
          {/* Map over the rows (outer array) */}
          {keys.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-green-700 last:border-b-0">
              {/* Map over the keys in each row (inner array) */}
              {row.map((key, colIndex) => (
                <td key={colIndex} className="py-3 px-3 text-xl border border-green-700 bg-green-900 hover:bg-green-800 transition duration-200">
                  {key}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KeysTable;
