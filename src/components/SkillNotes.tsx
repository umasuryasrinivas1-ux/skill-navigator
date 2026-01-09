import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Save, Loader2 } from 'lucide-react';

interface SkillNotesProps {
  userId: string;
  roadmapId: string;
  skillName: string;
  phase: string;
}

export default function SkillNotes({
  userId,
  roadmapId,
  skillName,
  phase,
}: SkillNotesProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [skillName, phase]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_notes')
        .select('content')
        .eq('user_id', userId)
        .eq('roadmap_id', roadmapId)
        .eq('skill_name', skillName)
        .eq('phase', phase)
        .maybeSingle();

      if (error) throw error;
      
      const noteContent = data?.content || '';
      setContent(noteContent);
      setOriginalContent(noteContent);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (content === originalContent) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('skill_notes')
        .upsert({
          user_id: userId,
          roadmap_id: roadmapId,
          skill_name: skillName,
          phase: phase,
          content: content,
        }, {
          onConflict: 'user_id,roadmap_id,skill_name,phase'
        });

      if (error) throw error;
      
      setOriginalContent(content);
      toast.success('Notes saved!');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = content !== originalContent;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Personal Notes
        </h3>
        {hasChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </Button>
        )}
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes here... Tips, reminders, code snippets, etc."
        className="min-h-[120px] resize-none bg-secondary/30 border-border"
      />
      <p className="text-xs text-muted-foreground">
        Your notes are saved privately and only visible to you.
      </p>
    </div>
  );
}