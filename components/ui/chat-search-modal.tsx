import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface ChatSearchModalProps {
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
}

export function ChatSearchModal({
  isSearchModalOpen,
  setIsSearchModalOpen,
}: ChatSearchModalProps) {
  return (
    <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search through your conversations, settings, and more.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
