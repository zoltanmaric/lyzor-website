import { FlyingObjects } from "./FlyingObjects";
import { NavPill } from "./NavPill";

const HERO_VIDEO_SRC =
  "https://framerusercontent.com/assets/9f3YOJWd8t3cibP1iqPDR1mCMro.mp4";
const HERO_POSTER_SRC =
  "https://framerusercontent.com/images/WjMeLOt3HEE9cWpQCCn4avE7yEg.png?scale-down-to=2048&lossless=1";
const HERO_FILTER = "hue-rotate(-20deg) saturate(1.14)";

export default function Home() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 overflow-hidden bg-[rgb(249,250,251)]"
      >
        <video
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover motion-reduce:hidden"
          style={{ filter: HERO_FILTER }}
        />
        <div
          className="hidden size-full bg-cover bg-center motion-reduce:block"
          style={{
            backgroundImage: `url(${HERO_POSTER_SRC})`,
            filter: HERO_FILTER,
          }}
        />
      </div>

      <NavPill />

      <main className="relative">
        <span id="top" className="absolute inset-x-0 top-0" aria-hidden="true" />
        <FlyingObjects />
        <section className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full text-center">
            <h1 className="text-heading-hero">
              <span className="gradient-brand">Lyzor Therapeutics</span>
            </h1>
            <p className="text-body-s text-body-text mt-6">
              AI-guided bacteriophage matching
            </p>
          </div>
        </section>

        <section
          id="story"
          className="flex flex-col items-center px-5 py-15"
        >
          <div className="flex w-full max-w-3xl flex-col gap-8 pt-10">
            <h2 className="text-section-title">
              <span className="gradient-section">The Story of Us</span>
            </h2>
            <div className="text-body-text flex flex-col gap-8 pb-5">
              <p className="text-body-l">
                Phage therapy has a bottleneck: matching.
              </p>
              <p className="text-body-l">
                Finding a phage that works against a specific bacterial isolate
                still relies on slow, brute-force wet-lab screening. Labs may
                need to test many candidates over several days before finding a
                useful hit.
              </p>
              <p className="text-body-l">
                We built a prediction model for E. coli phage-host matching to
                help labs prioritize the most promising phages before screening
                begins.
              </p>
              <p className="text-body-l">
                Our goal is to make isolate-specific phage matching faster,
                cheaper, and scalable, especially for multidrug-resistant E.
                coli, where time matters.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
