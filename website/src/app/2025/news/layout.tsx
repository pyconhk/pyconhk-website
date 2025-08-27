import Layout from '../components/layout';

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout defaultXPadding='px-4'>{children}</Layout>;
}
