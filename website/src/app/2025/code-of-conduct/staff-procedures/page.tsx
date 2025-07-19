import React from 'react';

export default function EnforcementProcedures() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        Enforcement Procedures
      </h1>
      <div className='space-y-6 text-gray-700 mt-4'>
        <p>
          This document summarizes the procedures the PyCon US staff uses to
          enforce the Code of Conduct.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Summary of processes
        </h2>
        <p>
          When the work group receives a report of a possible Code of Conduct
          violation, it will:
        </p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>Acknowledge the receipt of the report.</li>
          <li className='md:pl-2'>Evaluate conflicts of interest.</li>
          <li className='md:pl-2'>
            Call a meeting of Code of Conduct responders who do not have a
            conflict of interest.
          </li>
          <li className='md:pl-2'>Evaluate the reported incident.</li>
          <li className='md:pl-2'>Propose a behavioral modification plan.</li>
          <li className='md:pl-2'>
            Propose consequences for the reported behavior.
          </li>
          <li className='md:pl-2'>
            Vote on behavioral modification plan and consequences for the
            reported person.
          </li>
          <li className='md:pl-2'>
            Contact online community administrators/moderators to approve the
            behavioral modification plan and consequences.
          </li>
          <li className='md:pl-2'>Follow up with the reported person.</li>
          <li className='md:pl-2'>Decide further responses.</li>
          <li className='md:pl-2'>Follow up with the reporter.</li>
        </ul>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Acknowledge the report
        </h2>
        <p>
          Reporters should receive an emailed acknowledgment of the receipt of
          their report within 24 hours.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Conflict of interest policy
        </h2>
        <p>Examples of conflicts of interest include:</p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            The reporter or reported person is your manager.
          </li>
          <li className='md:pl-2'>
            You have a romantic or platonic relationship with either the
            reporter or the reported person. It&apos;s fine to participate if
            they are an acquaintance.
          </li>
          <li className='md:pl-2'>
            The reporter or reported person is your metamour. (This is a term
            used in the poly community; the short definition is&nbsp;
            <a
              href='https://www.urbandictionary.com/define.php?term=Metamour'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>here</b>
            </a>
            , and a longer description is&nbsp;
            <a
              href='https://solopoly.net/2012/09/29/whats-a-metamour-on-my-terms/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>here</b>
            </a>
            .)
          </li>
          <li className='md:pl-2'>
            The reporter or reported person is your family member.
          </li>
          <li className='md:pl-2'>
            The reporter or reported person is your direct client.
          </li>
          <li className='md:pl-2'>
            The reporter or reported person is someone you work closely with.
            This could be someone on your team or someone who works on the same
            project as you.
          </li>
          <li className='md:pl-2'>
            The reporter or reported person is a maintainer who regularly
            reviews your contributions.
          </li>
        </ul>
        <p>
          Committee members do not need to state why they have a conflict of
          interest, only that one exists. Other work group members should not
          ask why the person has a conflict of interest.
        </p>
        <p>
          Anyone who has a conflict of interest will remove themselves from the
          discussion of the incident, and recuse themselves from voting on a
          response to the report.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Evaluating a report
        </h2>
        <h3 className='text-xl font-semibold mt-6 mb-2'>JURISDICTION</h3>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            <i>Is this a Code of Conduct violation?</i> Is this behavior on our
            list of inappropriate behavior? Is it borderline inappropriate
            behavior? Does it violate our community norms?
          </li>
          <li className='md:pl-2'>
            <i>
              Did this occur in a space that is within our Code of
              Conduct&apos;s scope?
            </i>{' '}
            If the incident occurred outside the community, but a community
            member&apos;s mental health or physical safety may be negatively
            impacted if no action is taken, the incident may be in scope.
            Private conversations in community spaces are also in scope.
          </li>
        </ul>
        <h3 className='text-xl font-semibold mt-6 mb-2'>IMPACT</h3>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            <i>
              Did this incident occur in a private conversation or in a public
              space?
            </i>{' '}
            Incidents that all community members can see will have more negative
            impact.
          </li>
          <li className='md:pl-2'>
            <i>
              Does this behavior negatively impact a marginalized group in our
              community?
            </i>{' '}
            Is the reporter a person from a marginalized group in our community?
            How is the reporter being negatively impacted by the reported
            person&apos;s behavior? Are members of the marginalized group likely
            to disengage with the community if no action was taken on this
            report?
          </li>
          <li className='md:pl-2'>
            <i>Does this incident involve a community leader?</i> Community
            members often look up to community leaders to set the standard of
            acceptable behavior.
          </li>
        </ul>
        <h3 className='text-xl font-semibold mt-6 mb-2'>RISK</h3>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            <i>Does this incident include sexual harrasment?</i>
          </li>
          <li className='md:pl-2'>
            <i>Does this pose a safety risk?</i> Does the behavior put a
            person&apos;s physical safety at risk? Will this incident severely
            negatively impact someone&apos;s mental health?
          </li>
          <li className='md:pl-2'>
            <i>Is there a risk of this behavior being repeated?</i> Does the
            reported person understand why their behavior was inappropriate? Is
            there an established pattern of behavior from past reports?
          </li>
        </ul>
        <p>
          Reports which involve higher risk or higher impact may face more
          severe consequences than reports which involve lower risk or lower
          impact.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Propose a behavioral modification plan
        </h2>
        <p>
          The event staff will determine a concrete behavioral modification plan
          that ensures the inappropriate behavior is not repeated. The event
          staff will also discuss what actions may need to be taken if the
          reported person does not agree to the behavioral modification plan.
        </p>
        <p>
          What follows are examples of possible behavioral modification plans
          for incidents that occur in online spaces under the scope of this Code
          of Conduct. This behavioral modification list is not inclusive, and
          the event staff reserves the right to take any action it deems
          necessary.
        </p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            Requiring that the reported person not use specific language.
          </li>
          <li className='md:pl-2'>
            Requiring that the reported person not join in on specific types of
            discussions.
          </li>
          <li className='md:pl-2'>
            Requiring that the reported person not send private messages to a
            community member.
          </li>
          <li className='md:pl-2'>
            Requiring that the reported person not join specific communication
            channels.
          </li>
          <li className='md:pl-2'>
            Removing the reported person from administrator or moderator rights
            to community infrastructure.
          </li>
          <li className='md:pl-2'>
            Removing a volunteer from their duties and responsibilities.
          </li>
          <li className='md:pl-2'>
            Removing a person from leadership of relevant organizations.
          </li>
          <li className='md:pl-2'>
            Removing a person from membership of relevant organizations.
          </li>
        </ul>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Propose consequences
        </h2>
        <p>
          What follows are examples of possible consequences to an incident
          report. This consequences list is not inclusive, and the event staff
          reserves the right to take any action it deems necessary.
        </p>
        <p>Possible private responses to an incident include:</p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            Nothing, if the behavior was determined to not be a Code of Conduct
            violation.
          </li>
          <li className='md:pl-2'>A verbal or emailed warning.</li>
          <li className='md:pl-2'>A final warning.</li>
          <li className='md:pl-2'>
            Temporarily removing the reported person from the online community.
          </li>
          <li className='md:pl-2'>
            Permanently removing the reported person from the online community.
          </li>
          <li className='md:pl-2'>Publishing an account of the incident.</li>
        </ul>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Follow up with the reported person
        </h2>
        <p>
          The event staff will work with online community
          administrators/moderators to draft a response to the reported person.
          The email should contain:
        </p>
        <ul className='mt-4 list-disc ml-6 space-y-2'>
          <li className='md:pl-2'>
            A description of the person&apos;s behavior in neutral language.
          </li>
          <li className='md:pl-2'>The negative impact of that behavior.</li>
          <li className='md:pl-2'>A concrete behavioral modification plan.</li>
          <li className='md:pl-2'>Any consequences of their behavior.</li>
        </ul>
        <p>
          The work group should not state who reported this incident. They
          should attempt to anonymize any identifying information from the
          report. The reported person should be discouraged from contacting the
          reporter to discuss the report. If they wish to apologize to the
          reporter, the work group can accept the apology on behalf of the
          reporter.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Decide further responses
        </h2>
        <p>
          If the reported person provides additional context, the event staff
          may need to re-evaluate the behavioral modification plan and
          consequences.
        </p>
        <h2 className='text-2xl font-bold text-sky-600 mt-8 mb-4'>
          Follow up with the reporter
        </h2>
        <p>
          A person who makes a report should receive a follow up email stating
          what action was taken in response to the report. If the work group
          decided no response was needed, they should provide an email
          explaining why it was not a Code of Conduct violation. Reports that
          are not made in good faith (such as &quot;reverse sexism&quot; or
          &quot;reverse racism&quot;) may receive no response.
        </p>
        <p>
          The follow up email should be sent no later than one week after the
          receipt of the report. If deliberation or follow up with the reported
          person takes longer than one week, the work group should send a status
          email to the reporter.
        </p>
        <h3 className='text-xl font-semibold mt-6 mb-2'>Attribution</h3>
        <ol className='list-decimal ml-6 space-y-1'>
          <li className='md:pl-2'>
            The&nbsp;
            <a
              href='https://us.pycon.org/2023/about/code-of-conduct/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>PyCon Code of Conduct</b>
            </a>
            &nbsp; is licensed under a&nbsp;
            <a
              href='http://creativecommons.org/licenses/by/3.0/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>Creative Commons Attribution 3.0 Unported License</b>
            </a>
            .
          </li>
          <li className='md:pl-2'>
            Ada Initiative&apos;s guide titled &quot;&nbsp;
            <a
              href='http://geekfeminism.wikia.com/wiki/Conference_anti-harassment/Responding_to_reports'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>Conference anti-harassment/Responding to Reports</b>
            </a>
            &nbsp; &quot; is licensed under a&nbsp;
            <a
              href='http://creativecommons.org/licenses/by/3.0/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>Creative Commons Attribution 3.0 Unported License</b>
            </a>
            .
          </li>
          <li className='md:pl-2'>
            Audrey Eschright of&nbsp;
            <a
              href='http://safetyfirstpdx.org/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>Safety First PDX</b>
            </a>
            &nbsp; provided the impact vs risk assessment framework, which is
            licensed under a&nbsp;
            <a
              href='http://creativecommons.org/licenses/by-sa/3.0/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>
                Creative Commons Attribution Share-Alike 3.0 Unported License
              </b>
            </a>
            &nbsp; by Audrey Eschright of&nbsp;
            <a
              href='http://safetyfirstpdx.org/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>Safety First PDX</b>
            </a>
          </li>
          <li className='md:pl-2'>
            <a
              href='https://github.com/sagesharp/code-of-conduct-template/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>Code of Conduct template</b>
            </a>
            &nbsp; was created by Otter Tech and is licensed under a&nbsp;
            <a
              href='http://creativecommons.org/licenses/by/3.0/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              <b>Creative Commons Attribution 3.0 Unported License</b>
            </a>
            .
          </li>
        </ol>
      </div>
    </>
  );
}
