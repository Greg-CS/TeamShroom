import { loadMembers, loadShowcase, loadPokemonData } from '@/lib/data';
import { MemberDetail } from '@/components/MemberDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { member: string };
}

export default async function MemberPage({ params }: PageProps) {
  const memberKey = decodeURIComponent(params.member);
  
  const [members, showcase, pokemonData] = await Promise.all([
    loadMembers(),
    loadShowcase(),
    loadPokemonData()
  ]);

  const member = members.find(
    m => m.key.toLowerCase() === memberKey.toLowerCase()
  );

  if (!member) {
    notFound();
  }

  return (
    <MemberDetail
      member={member}
      showcase={showcase}
      pokemonData={pokemonData}
      allMembers={members}
    />
  );
}

export async function generateStaticParams() {
  const members = await loadMembers();
  return members.map(m => ({
    member: m.key
  }));
}
