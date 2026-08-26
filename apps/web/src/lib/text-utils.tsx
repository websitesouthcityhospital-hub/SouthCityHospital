import React from "react";

/**
 * Parses a plain text string and converts any Indian/standard phone numbers
 * (e.g., "+91 6901271223", "+916901271223", "6901271223") into interactive `tel:` anchor tags.
 */
export function renderTextWithTelLinks(text: string): React.ReactNode {
  const phoneRegex = /(\+91[\s-]?[0-9]{10}|[0-9]{10})/g;
  const parts = text.split(phoneRegex);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => {
    if (phoneRegex.test(part)) {
      const cleanTel = part.replace(/[\s-]/g, "");
      const formattedTel = cleanTel.startsWith("+") ? cleanTel : `+91${cleanTel}`;
      return (
        <a
          key={index}
          href={`tel:${formattedTel}`}
          className="font-semibold underline underline-offset-2 decoration-[var(--primary)] hover:opacity-80 transition-opacity"
          style={{ color: "var(--primary)" }}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
