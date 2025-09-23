'use client';

import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { AlertTriangle, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import Conversation from './_components/conversation';
import { useCreateOrGetConversation } from '@/features/conversations/api/use-create-or-get-conversation';

const MemberIdPage = () => {
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();

  const [conversationId, setConversationId] =
    useState<Id<'conversations'> | null>(null);

  const { data, mutate, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    mutate(
      {
        workspaceId,
        memberId,
      },
      {
        onSuccess: (data) => {
          setConversationId(data);
        },
        onError: () => {
          toast.error('Failed to get or create conversation');
        },
      },
    );
  }, [memberId, workspaceId, mutate]);

  if (isPending) {
    <div className="h-full flex items-center justify-center">
      <Loader className="animate-spin text-muted-foreground size-6" />
    </div>;
  }

  if (!conversationId) {
    <div className="h-full flex flex-col gap-y-2 items-center justify-center">
      <AlertTriangle className="text-muted-foreground size-6" />
      <p className="text-sm text-muted-foreground">Conversation not found</p>
    </div>;
  }

  return conversationId ? <Conversation id={conversationId} /> : null;
};

export default MemberIdPage;
