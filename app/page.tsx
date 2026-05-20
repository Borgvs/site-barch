import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { PullQuote } from "@/components/sections/PullQuote";
import { Process } from "@/components/sections/Process";
import { Bimarch } from "@/components/sections/Bimarch";
import { Portal } from "@/components/sections/Portal";
import { Manifesto } from "@/components/sections/Manifesto";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PullQuote />
        <Process />
        <Bimarch />
        <Portal />
        <Manifesto />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
