"use client";

export const LANGUAGES = [
  { code: "auto", name: "Auto-detect" },
  { code: "multi", name: "Multilingual (mixed)" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" },
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
] as const;

type Props = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export default function LanguageSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="language-select" className="text-sm font-medium text-zinc-700">
        Language
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 border border-zinc-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        aria-label="Transcription language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-zinc-500">
        Choose your language, or Auto-detect / Multilingual for mixed speech.
      </p>
    </div>
  );
}
