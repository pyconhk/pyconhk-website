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
  <WhatIsSprint />,
  <ProceduresOfSprint />,
  <SprintVSConference />,
  <WhoShouldAttend />,
  <BeginnersSuitable />,
  <Preparations />,
  <CanObserve />,
  <CanJoinLeave />,
  <ParticipationFee />,
  <ProjectsValidity />,
  <SprintLeadValidity />,
  <Resources />,
  <Projects />,
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
