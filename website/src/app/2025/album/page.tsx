import { NextResponse } from 'next/server';

export default async function Album() {
  return NextResponse.redirect(
    'https://drive.google.com/drive/folders/1xZPVXsE7_0amFbSM6lLgyeKsyzgmTd-k?usp=sharing',
    {
      status: 302,
    }
  );
}
