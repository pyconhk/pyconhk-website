import React from 'react';

interface ActionCardProps {
  topColorClassName: string;
  Icon: React.ReactNode;
  children: React.ReactNode;
}

export default async function ActionCard({
  topColorClassName,
  Icon,
  children,
}: ActionCardProps) {
  return (
    <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
      <div className={`h-3 ${topColorClassName}`}></div>
      <div className='p-8'>
        {Icon}
        {children}
      </div>
    </div>
  );
}
