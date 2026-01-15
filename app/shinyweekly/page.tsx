import { loadShinyWeekly, loadMembers } from '@/lib/data';
import { ShinyWeeklyPage } from '@/components/ShinyWeeklyPage';

export default async function ShinyWeekly() {
  const [weeks, members] = await Promise.all([
    loadShinyWeekly(),
    loadMembers()
  ]);
  
  return <ShinyWeeklyPage weeks={weeks} members={members} />;
}
