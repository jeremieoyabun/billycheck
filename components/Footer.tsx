import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-10 border-t mt-20">
      <div className="max-w-6xl mx-auto px-6 flex gap-6 text-sm text-gray-500">
        
        <Link href="/qui-sommes-nous" className="hover:underline">
          Qui sommes-nous
        </Link>

        <Link href="/faq" className="hover:underline">
          FAQ
        </Link>

      </div>
    </footer>
  );
}
