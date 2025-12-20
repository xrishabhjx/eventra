"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AIEventCreator({ onEventGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateEvent = async () => {
    if (!prompt.trim()) return toast.error("Please describe your event");
    setLoading(true);
    try {
      const response = await fetch("/api/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      
      const data = await response.json();
      onEventGenerated(data); // Sends data to parent
      
      toast.success("AI generated your event details!");
      setIsOpen(false);
      setPrompt("");
    } catch (error) {
      toast.error("AI Generation failed. Check console for details.");
      console.error("AI_ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" /> Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Event Creator</DialogTitle>
          <DialogDescription>Describe your event idea below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A 2-day workshop on Next.js..."
            rows={6}
          />
          <Button onClick={generateEvent} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}