"use client";

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
] as const;

type Props = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export default function LanguageSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-foreground">
        Language
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-4 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Transcription language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Choose your language, or Auto-detect / Multilingual for mixed speech.
      </p>
    </div>
  );
}
