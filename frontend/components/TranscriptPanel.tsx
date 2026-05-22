type Props = {
  text: string;
};

export default function TranscriptPanel({ text }: Props) {
  return (
    <div className="p-4 border mt-4 min-h-[200px]">
      <h2 className="font-bold mb-2">Transcript</h2>
      <p>{text || "No transcript yet..."}</p>
    </div>
  );
}