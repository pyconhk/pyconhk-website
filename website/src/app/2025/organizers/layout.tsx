import Layout from '../components/layout';

export default function OrganizersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
