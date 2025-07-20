import React from 'react';
import Link from 'next/link';

export default function ProceduresForReportingIncidents() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        Procedures for Reporting Incidents
      </h1>
      <div className='space-y-6 text-gray-700 mt-4'>
        <p>
          <b>
            If you believe someone is in physical danger, including from
            themselves
          </b>
          , the most important thing is to get that person help. Please contact
          the appropriate crisis number, non-emergency number, or police number.
          If you are a PyCon HK attendee, you can consult with a volunteer or
          staff member to help find an appropriate number.
        </p>
        <p>
          If you believe someone has violated the{' '}
          <b>
            <a
              href='/2025/code-of-conduct'
              className='text-sky-600 hover:text-sky-800'
              target='_blank'
            >
              Code of Conduct
            </a>
          </b>
          , we encourage you to report it. If you are unsure whether the
          incident is a violation, or whether the space where it happened is
          covered by the Code of Conduct, we encourage you to still report it.
          We are fine with receiving reports where we decide to take no action
          for the sake of creating a safer space.
        </p>
        <p>
          If you find that you need to make a report, and you cannot find the
          appropriate Code of Conduct reporting contact, you may report to the
          PyCon HK Code of Conduct email alias below. PyCon HK event staff will
          handle your report. If this happens, please also mention that you
          could not find specific reporting information so that we can improve.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          General Reporting Procedure
        </h2>
        <p>
          The best way to contact the PyCon HK Code of Conduct event staff is by
          email at&nbsp;
          <a
            href='mailto:pycon@pycon.hk'
            className='text-sky-600 hover:text-sky-800'
          >
            pycon@pycon.hk
          </a>
          . The members of the PyCon HK event staff who monitor this account
          are:
        </p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>Alex Au</li>
          <li className='md:pl-2'>Calvin Tsang</li>
        </ul>
        <p>
          In the event of a <b>conflict of interest</b>, you may directly
          contact any of the lead incident responders:
        </p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            Henry Law, Conference Chair of PyCon HK 2025
          </li>
        </ul>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Report Data
        </h2>
        <p>When you make a report via email or phone, please include:</p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            Your contact info (so we can get in touch with you if we need to
            follow up)
          </li>
          <li className='md:pl-2'>Date and time of the incident</li>
          <li className='md:pl-2'>Location of incident</li>
          <li className='md:pl-2'>Whether the incident is ongoing</li>
          <li className='md:pl-2'>Description of the incident</li>
          <li className='md:pl-2'>
            Identifying information of the reported person: name, physical
            appearance, height, clothing, voice accent, identifying badge
            information such as company name, ribbons, or badge number
          </li>
          <li className='md:pl-2'>
            Additional circumstances surrounding the incident
          </li>
          <li className='md:pl-2'>
            Other people involved in or witnesses to the incident and their
            contact information or description
          </li>
        </ul>
        <p>Please provide as much information as possible.</p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Confidentiality
        </h2>
        <p>
          <b>All reports will be kept confidential</b>. When we discuss
          incidents with people who are reported, we will anonymize details as
          much as we can to protect reporter privacy.
        </p>
        <p>
          However, some incidents happen in one-on-one interactions, and even if
          the details are anonymized, the reported person may be able to guess
          who made the report. If you have concerns about retaliation or your
          personal safety, please note those in your report. We still encourage
          you to report, so that we can support you while keeping our conference
          attendees safe. In some cases, we can compile several anonymized
          reports into a pattern of behavior, and take action on that pattern.
        </p>
        <p>
          In some cases, we may determine that a public statement will need to
          be made. If that&apos;s the case, the identities of all victims and
          reporters will remain confidential unless those individuals instruct
          us otherwise.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Report Handling Procedure
        </h2>
        <p>
          When you make a report to an incident responder, they will gather
          information about the incident according to the&nbsp;
          <b>
            <Link
              href='/2025/code-of-conduct/enforcement-procedures'
              className='text-sky-600 hover:text-sky-800'
            >
              Procedure For Incident Response
            </Link>
          </b>
          .
        </p>
        <p>
          After an incident responder takes the report, they will immediately
          consult with the PyCon HK event staff, unless there is a conflict of
          interest, in which case any non-interested parties will be contacted.
        </p>
        <p>
          If the incident is ongoing and needs to be immediately addressed, any
          lead incident responder may take appropriate action to ensure the
          safety of everyone involved. If the situation requires it, this may
          take the form of a referral to an appropriate non-PyCon HK agency,
          including the local police. PyCon HK is not equipped to handle
          emergency situations.
        </p>
        <p>
          If the incident is less urgent, the report will be discussed by the
          event staff, who will meet to determine an appropriate response.
          Examples of possible incident responses are outlined in the{' '}
          <b>
            <a
              href='/2025/code-of-conduct/enforcement-procedures'
              className='text-sky-600 hover:text-sky-800'
              target='_blank'
            >
              Procedure For Incident Response
            </a>
          </b>
          .
        </p>
        <p>
          Before any large in-person gathering conference, staff will have a
          mandatory meeting where incident response procedures will be outlined.
          After the conference, all incident responders will attend a debriefing
          session with the lead responders to discuss all incidents and
          determine any necessary follow-up actions.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Following up with Reporters
        </h2>
        <p>
          Within one week of an incident report, a member of the event staff, or
          one of the lead responders, will follow up with the person who made
          the report and provided their contact information. The follow up may
          include:
        </p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            An acknowledgment that the Code of Conduct responders discussed the
            situation
          </li>
          <li className='md:pl-2'>
            Whether or not the report was determined to be a violation of the
            Code of Conduct
          </li>
          <li className='md:pl-2'>
            What actions (if any) were taken to correct the reported behavior
          </li>
        </ul>
        <p>
          In some cases, the lead responders may need to ask additional
          questions about the incident in order to identify the reported person.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Conflicts of Interest
        </h2>
        <p>
          If an incident responder has a conflict of interest for a report, they
          will recuse themselves from the discussion and handling of the
          incident. The incident documentation will not be available to them,
          and they will excuse themselves from any conversations involving
          handling the incident.
        </p>
        <p>
          Should more than two of the PyCon HK lead incident responders need to
          recuse themselves, another PyCon HK staff member will step in as a
          temporary lead incident responder.
        </p>
        <p>
          This procedure was adapted from the Ada Initiative&apos;s guide titled
          &quot;
          <a
            href='http://geekfeminism.wikia.com/wiki/Conference_anti-harassment/Responding_to_reports'
            target='_blank'
            className='text-sky-600 hover:text-sky-800'
          >
            <b>Conference anti-harassment/Responding to Reports</b>
          </a>
          &quot;, the{' '}
          <a
            href='https://www.djangoproject.com/conduct/reporting/'
            target='_blank'
            className='text-sky-600 hover:text-sky-800'
          >
            <b>Django Project reporting guidelines</b>
          </a>{' '}
          (CC BY 3.0), with additions by{' '}
          <a
            href='https://otter.technology/'
            target='_blank'
            className='text-sky-600 hover:text-sky-800'
          >
            <b>Otter Tech</b>
          </a>
          .
        </p>
      </div>
    </>
  );
}
