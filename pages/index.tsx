import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

import React, { CanvasHTMLAttributes, useRef } from "react";
import "@tensorflow/tfjs-backend-webgl";

import ts from "@tensorflow-models/tfjs";
import { load } from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHands } from "../utils/handPoints";

const GestureRecognition: NextPage = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runHandpose = async () => {
    const net = await load();

    console.log("Handpose model loaded.");
    // Loop and detect hands

    setInterval(() => {
      detect(net);
    }, 1);
  };

  const detect = async (net: any) => {
    if (
      webcamRef?.current?.video?.readyState === 4 &&
      canvasRef?.current !== null
    ) {
      const video = webcamRef.current.video;
      webcamRef.current.video.height = video.videoHeight;
      webcamRef.current.video.width = video.videoWidth;

      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      const hand = await net.estimateHands(video);

      console.log(hand);

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
      </main>
    </div>
  );
};

export default GestureRecognition;
