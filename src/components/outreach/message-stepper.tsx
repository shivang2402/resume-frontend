"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertCircle } from "lucide-react";
import { StepBasicInfo } from "./step-basic-info";
import { StepContext } from "./step-context";
import { StepPreview } from "./step-preview";
import { outreachApi } from "@/lib/api/outreach";
import {
  WritingStyle,
  MessageLength,
  GenerateMessageResponse,
} from "@/types/outreach";
import { Application } from "@/types";
import { ThreadCreateModal } from "./thread-create-modal";
import { SaveTemplateModal } from "./save-template-modal";

interface MessageStepperProps {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export function MessageStepper({ open, onClose }: MessageStepperProps) {
  // Step tracking
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [company, setCompany] = useState("");
  const [style, setStyle] = useState<WritingStyle>("semi_formal");
  const [length, setLength] = useState<MessageLength>("short");
  const [templateId, setTemplateId] = useState<string | undefined>();
  const [matchingApps, setMatchingApps] = useState<Application[]>([]);

  // Step 2 state
  const [jdText, setJdText] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | undefined>();

  // Step 3 state
  const [generatedMessage, setGeneratedMessage] = useState<GenerateMessageResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const resetState = () => {
    setStep(1);
    setCompany("");
    setStyle("semi_formal");
    setLength("short");
    setTemplateId(undefined);
    setMatchingApps([]);
    setJdText("");
    setSelectedAppId(undefined);
    setGeneratedMessage(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const generateMessage = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await outreachApi.generate({
        company,
        style,
        length,
        template_id: templateId,
        jd_text: jdText || undefined,
        application_id: selectedAppId,
      });
      setGeneratedMessage(response);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate message");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStep1Next = () => {
    setStep(2);
  };

  const handleStep2Next = async () => {
    await generateMessage();
  };

  const handleStep2Skip = async () => {
    setJdText("");
    setSelectedAppId(undefined);
    await generateMessage();
  };

  const handleRefine = async (instructions: string) => {
    if (!generatedMessage) return;

    setIsRefining(true);
    setError(null);

    try {
      const response = await outreachApi.refine({
        original_message: generatedMessage.message,
        instructions,
        style,
        length,
      });
      setGeneratedMessage({
        ...generatedMessage,
        message: response.message,
        char_count: response.char_count,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refine message");
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage.message);
    }
  };

  const stepLabels = ["Basic Info", "Context", "Preview"];

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate New Message</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    s < step
                      ? "bg-primary text-primary-foreground"
                      : s === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    s === step ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {stepLabels[s - 1]}
                </span>
                {s < 3 && <div className="w-8 h-px bg-border mx-2" />}
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating your message...</p>
            </div>
          )}

          {/* Step Content */}
          {!isGenerating && step === 1 && (
            <StepBasicInfo
              company={company}
              setCompany={setCompany}
              style={style}
              setStyle={setStyle}
              length={length}
              setLength={setLength}
              templateId={templateId}
              setTemplateId={setTemplateId}
              matchingApps={matchingApps}
              setMatchingApps={setMatchingApps}
              onNext={handleStep1Next}
            />
          )}

          {!isGenerating && step === 2 && (
            <StepContext
              jdText={jdText}
              setJdText={setJdText}
              selectedAppId={selectedAppId}
              setSelectedAppId={setSelectedAppId}
              matchingApps={matchingApps}
              onBack={() => setStep(1)}
              onNext={handleStep2Next}
              onSkip={handleStep2Skip}
            />
          )}

          {!isGenerating && step === 3 && generatedMessage && (
            <StepPreview
              message={generatedMessage.message}
              charCount={generatedMessage.char_count}
              sectionsUsed={generatedMessage.sections_used}
              length={length}
              style={style}
              isRefining={isRefining}
              onRefine={handleRefine}
              onCopy={handleCopy}
              onStartThread={() => setShowThreadModal(true)}
              onSaveTemplate={() => setShowTemplateModal(true)}
              onBack={() => setStep(2)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Thread Creation Modal */}
      {showThreadModal && generatedMessage && (
        <ThreadCreateModal
          open={showThreadModal}
          onClose={() => setShowThreadModal(false)}
          defaultCompany={company}
          matchingApps={matchingApps}
          onCreated={() => {
            setShowThreadModal(false);
            handleClose();
          }}
        />
      )}

      {/* Save Template Modal */}
      {showTemplateModal && generatedMessage && (
        <SaveTemplateModal
          open={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          content={generatedMessage.message}
          style={style}
          length={length}
          onSaved={() => {
            setShowTemplateModal(false);
          }}
        />
      )}
    </>
  );
}
