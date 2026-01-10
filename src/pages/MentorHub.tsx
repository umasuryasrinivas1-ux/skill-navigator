import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Home, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MentorHub() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
                <div className="container px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        <h1 className="font-display font-bold text-lg">AI Mentor</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-7xl mx-auto px-4 py-4 h-[calc(100vh-4rem-5rem)]">
                <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-sm bg-card">
                    <iframe
                        src="https://app.relevanceai.com/agents/d7b62b/4dff2ac1-daff-4284-a79a-690a30a4ae40/b1a008ea-9f80-41fe-bdfd-f48a3619f328/share?hide_tool_steps=false&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%23685FFF&bubble_icon=pd%2Fchat&input_placeholder_text=Type+your+message...&hide_logo=false&hide_description=false"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="microphone"
                        title="AI Mentor"
                        className="w-full h-full"
                    />
                </div>
            </main>

            {/* Mobile Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
                <div className="flex items-center justify-around h-16">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <div className="p-1 rounded-full">
                            <Home className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Home</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <div className="p-1 rounded-full">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Roadmap</span>
                    </button>
                    <button
                        onClick={() => navigate('/trends')}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <div className="p-1 rounded-full">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Trends</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-primary"
                    >
                        <div className="p-1 rounded-full bg-primary/10">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Mentor</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
