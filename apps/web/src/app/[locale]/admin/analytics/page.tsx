import { redirect } from 'next/navigation';

export default function AdminAnalyticsRedirectPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/admin/reports`);
}
