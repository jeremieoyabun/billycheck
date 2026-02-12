import Image from "next/image";

export default function Billy({ expression = "logobilly", size = 160 }) {
  return (
    <Image
      src={`/billy/${expression}.png`}
      alt={`Billy ${expression}`}
      width={size}
      height={size}
      priority
    />
  );
}
