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

      <header className="fixed inset-x-0 top-6 z-10 flex justify-center px-4">
        <nav
          className="flex items-center gap-2 rounded-[20px] border border-white/70 bg-white/40 p-1.5 pl-4 backdrop-blur-md"
          style={{ boxShadow: "0 8px 7px rgba(117, 132, 214, 0.1)" }}
        >
          <span className="text-menu-logo gradient-brand pr-2">Lyzor Tx</span>

          <div className="grid shrink-0 grid-cols-3 gap-[3px] px-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="size-[5px] rounded-full bg-brand-purple"
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Contact"
            className="grid size-10 shrink-0 place-items-center rounded-2xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(66, 81, 166, 0.92) 0%, rgb(166, 165, 250) 100%)",
              boxShadow:
                "0 0.5px 0.29px -1px rgba(136, 138, 227, 0.53), 0 1.83px 1.1px -2px rgba(136, 138, 227, 0.5), 0 8px 4.8px -3px rgba(136, 138, 227, 0.36), inset 0 0 2px 0 rgba(30, 33, 115, 0.3)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://framerusercontent.com/images/KWIQA1fu0j0rgpoUIZjR54Gr7U.svg?width=16&height=16"
              alt=""
              width={16}
              height={16}
            />
          </button>
        </nav>
      </header>

      <main>
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
            <h3 className="text-section-title">
              <span className="gradient-section">The Story of Us</span>
            </h3>
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
