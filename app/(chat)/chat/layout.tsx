import { Nav } from '@/components/ui/navbar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full">
      <Nav>
        <div className="flex-1 overflow-hidden flex flex-col items-center">{children}</div>
      </Nav>
    </div>
  );
}
