import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

import React, { useState, useRef } from "react";
import "@tensorflow/tfjs-backend-webgl";

import ts from "@tensorflow-models/tfjs";
import { load } from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHands } from "../utils/handPoints";
import fp from "fingerpose";

const GestureRecognition: NextPage = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [emoji, setEmoji] = useState(null);

  const images = {
    thumbs_up: "/thumbs_up.png",
    victory: "/victory.png",
  };

  const runHandpose = async () => {
    const net = await load();

    console.log("Handpose model loaded.");
    // Loop and detect hands

    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net: any) => {
    if (
      webcamRef?.current?.video?.readyState === 4 &&
      canvasRef?.current !== null
    ) {
      const video = webcamRef.current.video;

      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      const hand = await net.estimateHands(video);

      // console.log(hand);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ]);

        const gesture = await GE.estimate(hand[0].landmarks, 8);
        // console.log(gesture.gestures);

        if (gesture?.gestures.length > 0) {
          const confidenceScore = gesture.gestures?.map(
            (prediction: any) => prediction.score
          );

          const maxConfidence = confidenceScore?.indexOf(
            Math.max.apply(null, confidenceScore)
          );

          setEmoji(gesture.gestures[maxConfidence].name);
        }
      }
      const ctx = canvasRef.current.getContext("2d");

      if (ctx) {
        drawHands(hand, ctx);
      }
    }
  };

  runHandpose();

  return (
    <div className={styles.container}>
      <Head>
        <title>AI Gesture Recognition</title>
        <meta name="description" content="using Tensorflow - Jordan Garcia" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Webcam ref={webcamRef} className={styles.webcam}></Webcam>
        <canvas ref={canvasRef} className={styles.webcam} />
        {emoji !== null && <img className={styles.emoji} src={images[emoji]} />}
      </main>
    </div>
  );
};

export default GestureRecognition;
