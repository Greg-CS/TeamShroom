import { loadDonators } from '@/lib/data';
import { DonatorsPage } from '@/components/DonatorsPage';

export default async function Donators() {
  const donators = await loadDonators();
  return <DonatorsPage donations={donators} />;
}
