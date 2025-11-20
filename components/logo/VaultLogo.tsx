import { cn } from "@/lib/utils";

interface VaultLogoProps {
  className?: string;
  size?: number;
}

export function VaultLogo({ className, size = 32 }: VaultLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      {/* Vault door shape */}
      <rect
        x="8"
        y="12"
        width="48"
        height="40"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Lock mechanism */}
      <circle
        cx="32"
        cy="32"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="32"
        cy="32"
        r="3"
        fill="currentColor"
      />
      {/* Handle */}
      <path
        d="M 32 24 L 32 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Decorative lines */}
      <path
        d="M 16 20 L 48 20"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M 16 44 L 48 44"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* V letter inside */}
      <path
        d="M 24 36 L 32 28 L 40 36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

