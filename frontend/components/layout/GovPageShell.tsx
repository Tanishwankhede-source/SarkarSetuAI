import GovHeader from "./GovHeader";
import GovFooter from "./GovFooter";
import VoiceAssistant from "../voice/VoiceAssistant";

interface Props {
  children: React.ReactNode;
  variant?: "public" | "citizen";
  onLogout?: () => void;
}

export default function GovPageShell({ children, variant = "public", onLogout }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-gov-page">
      <GovHeader variant={variant} onLogout={onLogout} />
      <div className="flex-1">{children}</div>
      <GovFooter />
      {variant === "citizen" && <VoiceAssistant />}
    </div>
  );
}
