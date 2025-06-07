import OSMD from "./components/osmd";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2">
       <h3 className="text-2xl">Good luck man</h3>
        <OSMD></OSMD>
      </main>
    </div>
  );
}