import { permanentRedirect } from 'next/navigation';

export default function HomePage() {
  return permanentRedirect('/chat');
}
