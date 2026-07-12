import { MessageSquare } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const Messages = () => (
  <div className="space-y-6">
    <AnimatedSection>
      <p className="section-label">Secure messaging</p>
      <h1 className="font-display text-foreground text-3xl font-bold mb-2">Messages</h1>
      <p className="font-body text-muted-foreground">
        HIPAA-secure messaging with your care team is coming soon.
      </p>
    </AnimatedSection>

    <AnimatedSection delay={0.1}>
      <div className="card-base text-center py-16">
        <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-foreground text-lg font-semibold mb-2">No messages yet</h2>
        <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">
          Once your physician reviews your case, you'll be able to message your care team here.
          For urgent questions, call our support line.
        </p>
      </div>
    </AnimatedSection>
  </div>
);

export default Messages;
