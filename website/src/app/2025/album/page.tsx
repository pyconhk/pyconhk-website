import { redirect, RedirectType } from 'next/navigation';

export default async function Album() {
  redirect(
    'https://drive.google.com/drive/folders/1xZPVXsE7_0amFbSM6lLgyeKsyzgmTd-k?usp=sharing',
    RedirectType.replace
  );
}
