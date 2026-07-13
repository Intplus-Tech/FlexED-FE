import { LogoLoader } from "@/components/ui/logo-loader";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <LogoLoader size={96} />
    </div>
  );
}
