"use client";
import React, { useState, useEffect, useRef } from "react";

const barcodeTypes = ["ean13"];
const barcodeUrl = "https://bwipjs-api.metafloor.com/";
const initialTime = 100; // 初期時間(秒)
const timeExtension = 20; // 正解時の時間延長(秒)
const timePenalty = 20; // 不正解時の時間減少(秒)

const Home = () => {
  const [barcodeText, setBarcodeText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [score, setScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  const generateRandomBarcodeText = () => {
    const chars = "0123456789";
    let randomText = "";
    for (let i = 0; i < 12; i++) {
      randomText += chars[Math.floor(Math.random() * chars.length)];
    }
    return randomText;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isStarted && !isTimeUp) {
      setUserInput(e.target.value);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isStarted && !isTimeUp) {
      if (userInput === barcodeText) {
        setResult("正解!");
        setScore(score + 1);
        setTimeLeft(timeLeft + timeExtension);
      } else {
        setResult("不正解...");
        setTimeLeft(timeLeft - timePenalty);
      }
      setBarcodeText(generateRandomBarcodeText());
      setUserInput("");
      inputRef.current?.focus();
    }
  };

  const startGame = () => {
    setIsStarted(true);
    setIsTimeUp(false);
    setResult("");
    setBarcodeText(generateRandomBarcodeText());
    setTimeLeft(initialTime);
    setScore(0);
    inputRef.current?.focus();

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          setIsTimeUp(true);
          setResult("時間切れ");
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    timerRef.current = timer;
  };

  const restartGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current as unknown as number);
    }
    startGame();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current as unknown as number);
      }
    };
  }, []);

  const barcodeType = barcodeTypes[0];
  const barcodeImgUrl = `${barcodeUrl}?bcid=${barcodeType}&text=${barcodeText}`;

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-4xl font-bold">タイピングゲーム</h1>
      <div className="space-y-2">
        <p>次のバーコードの数字を入力してください</p>
        <p>コード種類: {barcodeType}(コード先頭は考えない)</p>
      </div>
      {isStarted ? (
        <div className="flex flex-col items-center space-y-4">
          <img src={barcodeImgUrl} alt="Barcode" className="w-64 h-auto" />
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              ref={inputRef}
              disabled={isTimeUp}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isTimeUp}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
          </form>
          <div className="w-64 h-4 bg-gray-300 rounded-full">
            <div
              className="h-4 bg-green-500 rounded-full"
              style={{ width: `${(timeLeft / initialTime) * 100}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <button
          onClick={startGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          スタート
        </button>
      )}
      <div className="flex flex-col items-center">
        <p
          className={`text-2xl ${
            result === "正解!" ? "text-green-500" : "text-red-500"
          }`}
        >
          {result}
        </p>
        {isTimeUp && (
          <button
            onClick={restartGame}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
          >
            リスタート
          </button>
        )}
      </div>
      <p className="text-xl">スコア: {score}</p>
      <p className="text-2xl text-gray-100">{barcodeText}</p>
    </div>
  );
};

export default Home;
