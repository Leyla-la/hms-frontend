import { useState } from "react";
import { Button, Switch } from "@mantine/core";
import { IconArrowLeft, IconHome2, IconSearch } from "@tabler/icons-react";

type NotFoundPageProps = {
  homeHref?: string;
  onGoBack?: () => void;
};

export default function NotFoundPage({
  homeHref = "/",
  onGoBack,
}: NotFoundPageProps) {
  const [lightsOn, setLightsOn] = useState(true);

  const pageClass = lightsOn ? "bg-light text-dark" : "bg-dark text-neutral-50";
  const mutedText = lightsOn ? "text-neutral-600" : "text-neutral-300";
  const softText = lightsOn ? "text-neutral-500" : "text-neutral-400";
  const cardClass = lightsOn
    ? "border-neutral-200 bg-white/80"
    : "border-neutral-700 bg-neutral-900/70";

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-all duration-500 ${pageClass}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl transition-all duration-500 ${
            lightsOn ? "bg-primary-300/30" : "bg-primary-500/10"
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 h-80 w-80 rounded-full blur-3xl transition-all duration-500 ${
            lightsOn ? "bg-primary-200/25" : "bg-primary-700/10"
          }`}
        />
        <div
          className={`absolute right-0 top-1/3 h-96 w-96 rounded-full blur-3xl transition-all duration-500 ${
            lightsOn ? "bg-primary-100/25" : "bg-primary-400/10"
          }`}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${softText}`}>
              Error page
            </p>
            <h1 className="mt-2 text-lg font-semibold">404 / Page Not Found</h1>
          </div>

          <div className={`rounded-2xl border px-4 py-3 shadow-sm backdrop-blur ${cardClass}`}>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${mutedText}`}>
                Turn the light {lightsOn ? "off" : "on"}
              </span>

              <Switch
                checked={lightsOn}
                onChange={(e) => setLightsOn(e.currentTarget.checked)}
                size="md"
                color="teal"
                onLabel="ON"
                offLabel="OFF"
              />
            </div>
          </div>
        </div>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div
              className={`relative mx-auto aspect-square w-full max-w-[560px] rounded-[2rem] border transition-all duration-500 ${
                lightsOn
                  ? "border-neutral-200 bg-white/85 shadow-2xl shadow-primary-100/40"
                  : "border-neutral-700 bg-neutral-900/80 shadow-2xl shadow-black/30"
              }`}
            >
              <div className="absolute left-1/2 top-0 h-24 w-px -translate-x-1/2 bg-current opacity-30" />

              <div className="absolute left-1/2 top-20 -translate-x-1/2">
                <div
                  className={`relative h-16 w-16 rounded-full border transition-all duration-500 ${
                    lightsOn
                      ? "border-primary-300 bg-primary-200 shadow-[0_0_90px_rgba(31,173,159,0.45)]"
                      : "border-neutral-700 bg-neutral-800"
                  }`}
                >
                  <div className="absolute inset-x-4 -top-5 h-6 rounded-t-full border border-b-0 border-current opacity-30" />
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div
                    className={`select-none text-[7rem] font-black leading-none md:text-[10rem] ${
                      lightsOn ? "text-dark" : "text-neutral-800"
                    }`}
                  >
                    4
                    <span
                      className={`mx-2 inline-block transition-all duration-500 ${
                        lightsOn
                          ? "text-primary-500 drop-shadow-[0_0_24px_rgba(31,173,159,0.55)]"
                          : "text-primary-400"
                      }`}
                    >
                      0
                    </span>
                    4
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    {lightsOn ? (
                      <div className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
                        Page vanished into the light
                      </div>
                    ) : (
                      <div className="rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200">
                        Still searching in the dark
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`absolute bottom-10 left-1/2 h-4 w-3/4 -translate-x-1/2 rounded-full blur-xl transition-all duration-500 ${
                  lightsOn ? "bg-primary-300/25" : "bg-black/40"
                }`}
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="max-w-xl">
              <p
                className={`mb-3 text-sm font-semibold uppercase tracking-[0.28em] ${
                  lightsOn ? "text-primary-600" : "text-primary-300"
                }`}
              >
                Lost route
              </p>

              <h2 className="text-4xl font-black leading-tight md:text-6xl">
                This page has gone missing.
              </h2>

              <p className={`mt-6 max-w-lg text-base leading-7 md:text-lg ${mutedText}`}>
                The page you’re trying to reach may have been moved, renamed, removed,
                or never existed in the first place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  component="a"
                  href={homeHref}
                  size="md"
                  radius="xl"
                  leftSection={<IconHome2 size={18} />}
                  className={`!h-12 !px-6 !text-white ${
                    lightsOn
                      ? "!bg-primary-600 hover:!bg-primary-700"
                      : "!bg-primary-500 hover:!bg-primary-400"
                  }`}
                >
                  Go Home
                </Button>

                <Button
                  variant="subtle"
                  size="md"
                  radius="xl"
                  leftSection={<IconArrowLeft size={18} />}
                  className={`!h-12 !px-6 ${
                    lightsOn
                      ? "!bg-neutral-100 !text-neutral-700 hover:!bg-neutral-200"
                      : "!bg-neutral-800 !text-neutral-100 hover:!bg-neutral-700"
                  }`}
                  onClick={() => {
                    if (onGoBack) {
                      onGoBack();
                    } else if (typeof window !== "undefined") {
                      window.history.back();
                    }
                  }}
                >
                  Go Back
                </Button>
              </div>

              <div className={`mt-10 rounded-3xl border p-5 ${cardClass}`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 rounded-2xl p-3 ${
                      lightsOn ? "bg-primary-50" : "bg-neutral-800"
                    }`}
                  >
                    <IconSearch
                      size={22}
                      className={lightsOn ? "text-primary-700" : "text-primary-300"}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Helpful next step</h3>
                    <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
                      Check the URL for typos, return to the homepage, or route users
                      back to a valid section from your app router.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
}