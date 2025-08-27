import Layout from '../components/layout';

export default function VolunteersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
