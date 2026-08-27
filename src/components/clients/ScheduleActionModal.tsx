import React from 'react';
import { ContactChannel } from '../../types';
import { ScheduleMessageModal } from '../messaging/ScheduleMessageModal';

interface ScheduleActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  companyName: string;
  currentTitle?: string;
  currentDate?: string;
  currentChannel?: ContactChannel;
  onSchedule: (title: string, date: string, channel: ContactChannel) => Promise<void>;
}

export const ScheduleActionModal: React.FC<ScheduleActionModalProps> = ({
  isOpen,
  onClose,
  leadId,
  currentTitle,
  currentDate,
  currentChannel,
  onSchedule,
}) => {
  return (
    <ScheduleMessageModal
      isOpen={isOpen}
      onClose={onClose}
      initialLeadId={leadId}
      initialActionType={currentTitle}
      initialDate={currentDate}
      initialChannel={currentChannel}
      onSuccess={async (action) => {
        if (onSchedule) {
          await onSchedule(
            action.customMessage || action.actionType || 'Ação de prospecção',
            action.scheduledDate,
            action.channel
          );
        }
      }}
    />
  );
};
