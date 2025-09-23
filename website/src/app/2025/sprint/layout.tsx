import Layout from '../components/layout';

export default function SprintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout defaultXPadding='px-4'>{children}</Layout>;
}
