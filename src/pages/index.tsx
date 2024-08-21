import Head from "next/head";
import Image from "next/image";
import Script from "next/script";
import videojs from "video.js";
import { IvsChat } from "@/components/IvsChat";
import "video.js/dist/video-js.css";
import { registerIVSQualityPlugin, registerIVSTech } from "amazon-ivs-player";

export default function Home() {
  return (
    <>
      <div className="bg-gray-800 h-full min-h-screen flex flex-col items-center">
        <Head>
          <title>JAWS PANKRATION 2024</title>
          <meta name="description" content="JAWS PANKRATION 2024" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Script
          src="https://player.live-video.net/1.5.0/amazon-ivs-player.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            registerIVSTech(videojs, {
              wasmWorker: "./amazon-ivs-wasmworker.min.js",
              wasmBinary: "./amazon-ivs-wasmworker.min.wasm",
            });
            registerIVSQualityPlugin(videojs);

            const player = videojs(
              "video-player",
              {
                techOrder: ["AmazonIVS"],
              },
              () => {
                console.log("Player is ready to use!");
                (player as any).enableIVSQualityPlugin();
                player.src(process.env.NEXT_PUBLIC_IVS_STREAM_URL as string);
              },
            );
          }}
        />

        <header className="text-center w-full" />

        <div className="w-full max-w-6xl px-4">
          <Image
            src="/jawspankration_main-image.png"
            alt="JAWS PANKRATION header"
            width={1440}
            height={120}
            className="w-full h-auto"
          />
        </div>

        <div className="grid grid-cols-5 my-12">
          <div className="main w-full max-w-4xl col-span-3 px-2 sm:px-4">
            <video
              id="video-player"
              controls
              playsInline
              width="850"
              height="500"
              autoPlay
              className="video-js vjs-big-play-centered"
            ></video>
          </div>
          <div className="col-span-2">
            <IvsChat />
          </div>
        </div>
      </div>
    </>
  );
}
