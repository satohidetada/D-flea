"use client";
import { useState } from "react";

export default function TutorialModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "ようこそ D-fleaへ！",
      desc: "D-fleaは、「現金直接取引」のフリマアプリです。決済・配送機能はありません。",
      icon: "🤝",
    },
    {
      title: "プロフィールの設定",
      desc: "右上の「👤アイコン」から、あなたの所属拠点を設定しましょう。受け渡し場所の目安になります。",
      icon: "👤",
    },
    {
      title: "商品を出品する",
      desc: "右下の「📸出品」ボタンから、不要なものを出品してみましょう。",
      icon: "📸",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          <div className="text-6xl mb-6 bg-gray-50 w-24 h-24 flex items-center justify-center rounded-full mx-auto">
            {steps[step - 1].icon}
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-3 tracking-tighter">
            {steps[step - 1].title}
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
            {steps[step - 1].desc}
          </p>
          
          <div className="flex gap-1 justify-center mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i + 1 === step ? "w-6 bg-red-600" : "w-1.5 bg-gray-200"}`} />
            ))}
          </div>

          <button
            onClick={() => step < steps.length ? setStep(step + 1) : onClose()}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 transition"
          >
            {step === steps.length ? "はじめる！" : "次へ"}
          </button>
        </div>
      </div>
    </div>
  );
}