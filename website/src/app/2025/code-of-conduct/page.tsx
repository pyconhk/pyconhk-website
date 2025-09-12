import Link from 'next/link';

export default function CodeOfConduct() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-center'>
        Code of Conduct Overview
      </h1>
      <div className='space-y-6 text-gray-700 mt-4'>
        <p>
          PyCon Hong Kong is a community conference intended for networking and
          collaboration in the developer community.
        </p>
        <p>
          We value the participation of each member of the Python community and
          want all attendees to have an enjoyable and fulfilling experience.
          Accordingly, all attendees are expected to show respect and courtesy
          to other attendees throughout the conference and at all conference
          events, whether officially sponsored by the PyCon Hong Kong organisers
          or not.
        </p>
        <p>
          To make clear what is expected, all staff, attendees, speakers,
          exhibitors, organizers, and volunteers at any PyCon event are required
          to conform to the following Code of Conduct. Organizers will enforce
          this code throughout the event.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Our Standards
        </h2>
        <p>
          PyCon is dedicated to providing a positive conference experience for
          everyone, regardless of age, gender identity and expression, sexual
          orientation, disability, physical appearance, body size, ethnicity,
          nationality, race, or religion (or lack thereof), education, or
          socio-economic status.
        </p>
        <p>
          Examples of behavior that contributes to creating a positive
          environment include:
        </p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>Being kind to others</li>
          <li className='md:pl-2'>Behaving professionally</li>
          <li className='md:pl-2'>Using welcoming and inclusive language</li>
          <li className='md:pl-2'>
            Being respectful of differing viewpoints and experiences
          </li>
          <li className='md:pl-2'>
            Gracefully accepting constructive criticism
          </li>
          <li className='md:pl-2'>
            Focusing on what is best for the community
          </li>
          <li className='md:pl-2'>
            Showing empathy towards other community members
          </li>
        </ul>
        <p>Examples of unacceptable behavior by participants include:</p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            Harassment of conference participants in any form
          </li>
          <li className='md:pl-2'>
            Deliberate intimidation, stalking, or following
          </li>
          <li className='md:pl-2'>
            Violent threats or language directed against another person
          </li>
          <li className='md:pl-2'>
            Sexual language and imagery in any conference venue, including talks
          </li>
          <li className='md:pl-2'>Insults or put downs</li>
          <li className='md:pl-2'>
            Sexist, racist, homophobic, transphobic, ableist, or exclusionary
            jokes
          </li>
          <li className='md:pl-2'>Excessive swearing</li>
          <li className='md:pl-2'>Unwelcome sexual attention or advances</li>
          <li className='md:pl-2'>Unwelcome physical contact</li>
          <li className='md:pl-2'>
            Sustained disruption of talks or other events
          </li>
          <li className='md:pl-2'>
            Other conduct that is inappropriate for a professional audience
            including people of many different backgrounds
          </li>
        </ul>
        <p>
          Participants asked to stop any inappropriate behavior are expected to
          comply immediately.
        </p>
        <p>
          If a participant engages in behavior that violates this code of
          conduct, the conference organizers may take any action they deem
          appropriate, including warning the offender or expulsion from the
          conference with no refund.
        </p>
        <p>
          Thank you for helping make this a welcoming, friendly event for all.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Weapons Policy
        </h2>
        <p>
          No weapons are allowed at conference venues, including but not limited
          to explosives (including fireworks), guns, and large knives such as
          those used for hunting or display, as well as any other item used for
          the purpose of causing injury or harm to others. Anyone seen in
          possession of one of these items will be asked to leave immediately,
          and will only be allowed to return without the weapon.
        </p>
        <p>
          Attendees are further expected to comply with all state and local laws
          on this matter.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>Scope</h2>
        <p>
          All PyCon Hong Kong attendees are subject to the Code of Conduct. This
          includes PyCon Hong Kong staff and volunteers, as well as attendees of
          the tutorials, workshops, summits, poster sessions, receptions,
          conference, sprints, and sponsored or unofficial events.
        </p>
        <p>
          Exhibitors in the expo hall, sponsor or vendor booths, or similar
          activities are also subject to the Code of Conduct. In particular,
          exhibitors should not use sexualized images, activities, or other
          material. Booth staff (including volunteers) should not use sexualized
          clothing/uniforms/costumes, or otherwise create a sexualized
          environment.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Contact Information
        </h2>
        <p>
          If you believe that someone is violating the code of conduct during a
          PyCon event, or have any other concerns, please contact a member of
          the event staff immediately.
        </p>
        <p>
          PyCon Hong Kong
          <br />
          Email:{' '}
          <a
            href='mailto:pycon@pycon.hk'
            className='text-sky-600 hover:text-sky-800'
          >
            pycon@pycon.hk
          </a>
        </p>
        <p>In case of a conflict of interest, you can individually contact:</p>
        <p>
          Conference Chair of PyCon HK 2025
          <br />
          Mr. Henry Law
        </p>
        <p>
          Conference staff will be happy to help participants contact
          hotel/venue security or local law enforcement, provide escorts, or
          otherwise assist any attendee to feel safe for the duration of the
          conference. We value your attendance.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Procedure for Handling Incidents
        </h2>
        <p>
          <Link
            href='/2025/code-of-conduct/attendee-reporting'
            className='text-sky-600 hover:text-sky-800'
          >
            Procedures for Reporting Incidents
          </Link>
        </p>
        <p>
          <Link
            href='/2025/code-of-conduct/staff-procedures'
            className='text-sky-600 hover:text-sky-800'
          >
            Enforcement Procedures
          </Link>
        </p>
        <p>
          This Code of Conduct was forked from PyCon US from the&nbsp;
          <a
            href='https://github.com/python/pycon-code-of-conduct'
            target='_blank'
            className='text-sky-600 hover:text-sky-800'
          >
            <b>Python GitHub</b>
          </a>
          .
        </p>
        <p>
          The PyCon Code of Conduct is licensed under a&nbsp;
          <a
            href='http://creativecommons.org/licenses/by/3.0/'
            target='_blank'
            className='text-sky-600 hover:text-sky-800'
          >
            <b>Creative Commons Attribution 3.0 Unported License</b>
          </a>
          .
        </p>
      </div>
    </>
  );
}
