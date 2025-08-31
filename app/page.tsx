import { permanentRedirect } from 'next/navigation';
import { URLS } from '@/lib/config/config';

export default function HomePage() {
  return permanentRedirect(URLS.defaultRedirect);
}
