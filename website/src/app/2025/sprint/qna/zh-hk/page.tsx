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
  <WhatIsSprintChinese key='what-is-sprint-chinese' />,
  <ProceduresOfSprintChinese key='procedures-of-sprint-chinese' />,
  <SprintVSConferenceChinese key='sprint-vs-conference-chinese' />,
  <WhoShouldAttendChinese key='who-should-attend-chinese' />,
  <BeginnersSuitableChinese key='beginner-suitable-chinese' />,
  <PreparationsChinese key='preparations-chinese' />,
  <CanObserveChinese key='can-observe-chinese' />,
  <CanJoinLeaveChinese key='can-join-leave-chinese' />,
  <ParticipationFeeChinese key='participation-fee-chinese' />,
  <ProjectsValidityChinese key='projects-validity-chinese' />,
  <SprintLeadValidityChinese key='sprint-lead-validity-chinese' />,
  <ResourcesChinese key='resources-chinese' />,
  <ProjectsChinese key='projects-chinese' />,
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
