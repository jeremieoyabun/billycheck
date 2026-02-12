import Image from "next/image";

export type BillyExpression =
  | "normal"
  | "searching"
  | "success"
  | "error";

interface BillyProps {
  expression?: BillyExpression;
  size?: number;
  className?: string;
}

export function Billy({ expression = "normal", size = 120, className = "" }: BillyProps) {
  return (
    <Image
      src={`/billy/${expression}.png`}
      alt={`Billy – ${expression}`}
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
