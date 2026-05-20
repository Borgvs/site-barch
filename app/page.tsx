import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { PullQuote } from "@/components/sections/PullQuote";
import { Stack } from "@/components/sections/Stack";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { Manifesto } from "@/components/sections/Manifesto";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PullQuote />
        <Stack />
        <Process />
        <Projects />
        <Manifesto />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
