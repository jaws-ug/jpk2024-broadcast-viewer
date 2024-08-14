import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Script from 'next/script';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { registerIVSQualityPlugin, registerIVSTech } from 'amazon-ivs-player';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>JAWS PANKRATION 2024</title>
        <meta name="description" content="JAWS PANKRATION 2024" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Script src="https://player.live-video.net/1.24.0/amazon-ivs-quality-plugin.min.js" />
      <Script src="https://player.live-video.net/1.24.0/amazon-ivs-videojs-tech.min.js" />
      <Script
        src="https://player.live-video.net/1.5.0/amazon-ivs-player.min.js"
        strategy="afterInteractive"
        onLoad={() => {
            registerIVSTech(videojs, {wasmWorker: "./amazon-ivs-wasmworker.min.js", wasmBinary: "./amazon-ivs-wasmworker.min.wasm"});
            registerIVSQualityPlugin(videojs);

            const player = videojs("video-player", {
              techOrder: ["AmazonIVS"],
            }, () => {
              console.log("Player is ready to use!");
              (player as any).enableIVSQualityPlugin();
              player.src(process.env.NEXT_PUBLIC_IVS_STREAM_URL as string);
            });
        }}
      />
      <header className="text-center">
        <Image src="/jawspankration_main-image.png" alt="JAWS PANKRATION header" width={1440} height={230} />
      </header>
      <main className={styles.main}>
        <video
          id="video-player"
          width="1000"
          height="700"
          controls
          playsInline
          autoPlay
          className="px-8 w-11/12 xl:w-7/12 h-200px sm:h-400px xl:h-600px video-js vjs-big-play-centered"
        ></video>
      </main>
    </div>
  );
}
