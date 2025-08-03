import {
  BeginnersSuitableChinese,
  CanJoinLeaveChinese,
  CanObserveChinese,
  ParticipationFeeChinese,
  PreparationsChinese,
  ProceduresOfSprintChinese,
  ProjectsChinese,
  ProjectsValidityChinese,
  ResourcesChinese,
  SprintLeadValidityChinese,
  SprintVSConferenceChinese,
  WhatIsSprintChinese,
  WhoShouldAttendChinese,
} from './components/SprintQnASectionsChinese';


const sprintQnAChineseSections: React.ReactNode[] = [
  <WhatIsSprintChinese />,
  <ProceduresOfSprintChinese />,
  <SprintVSConferenceChinese />,
  <WhoShouldAttendChinese />,
  <BeginnersSuitableChinese />,
  <PreparationsChinese />,
  <CanObserveChinese />,
  <CanJoinLeaveChinese />,
  <ParticipationFeeChinese />,
  <ProjectsValidityChinese />,
  <SprintLeadValidityChinese />,
  <ResourcesChinese />,
  <ProjectsChinese />,
];

export default async function SprintQnAChinese() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-center'>
        Sprint Q&A
      </h1>
      {sprintQnAChineseSections.map((section, index) => (
        <div key={index} className='mt-16'>
          {section}
        </div>
      ))}
    </>
  );
}
