import {
  BeginnersSuitable,
  CanJoinLeave,
  CanObserve,
  ParticipationFee,
  Preparations,
  ProceduresOfSprint,
  Projects,
  ProjectsValidity,
  Resources,
  SprintLeadValidity,
  SprintVSConference,
  WhatIsSprint,
  WhoShouldAttend,
} from './components/SprintQnASections';

const sprintQnASections: React.ReactNode[] = [
  <WhatIsSprint key='what-is-sprint' />,
  <ProceduresOfSprint key='procedures-of-sprint' />,
  <SprintVSConference key='sprint-vs-conference' />,
  <WhoShouldAttend key='who-should-attend' />,
  <BeginnersSuitable key='beginners-suitable' />,
  <Preparations key='preparations' />,
  <CanObserve key='can-observe' />,
  <CanJoinLeave key='can-join-leave' />,
  <ParticipationFee key='participation-fee' />,
  <ProjectsValidity key='projects-validity' />,
  <SprintLeadValidity key='sprint-lead-validity' />,
  <Resources key='resources' />,
  <Projects key='projects' />,
];

export default async function SprintQnA() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-center'>
        Sprint Q&A
      </h1>
      {sprintQnASections.map((section, index) => (
        <div key={index} className='mt-16'>
          {section}
        </div>
      ))}
    </>
  );
}
