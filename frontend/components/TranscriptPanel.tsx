type Props = {
  text: string;
};

export default function TranscriptPanel({
  text,
}: Props) {
  return (
    <div className="p-6 border rounded-xl shadow-md bg-white mt-6 min-h-[200px]">

      <h2 className="text-xl font-bold mb-4">
        Transcript
      </h2>

      <div className="text-gray-700 whitespace-pre-wrap">
        {text ||
          "No transcript yet..."}
      </div>

    </div>
  );
}