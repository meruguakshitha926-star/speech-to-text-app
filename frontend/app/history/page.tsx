"use client";

import { useState } from "react";

import Header from "../../components/Header";
import RecorderPanel from "../../components/RecorderPanel";
import TranscriptPanel from "../../components/TranscriptPanel";

export default function HistoryPage() {
  const [text, setText] = useState("");

  return (
    <div>
      <Header />

      <RecorderPanel />

      <TranscriptPanel text={text} />
    </div>
  );
}