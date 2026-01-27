// endorsementLetter.jsx
import { forwardRef } from "react";

const EndorsementLetter = forwardRef(
  ({ supervisor, company, students, startDate }, ref) => {
    return (
      <div
        ref={ref}
        className="mx-auto bg-white p-10 text-justify leading-relaxed print:w-[210mm] print:min-h-[297mm] print:mx-0 print:p-8"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold">REPUBLIC OF THE PHILIPPINES</p>
          <p className="text-sm font-semibold">POLYTECHNIC UNIVERSITY OF THE PHILIPPINES</p>
          <p className="text-sm font-semibold">OFFICE OF THE VICE PRESIDENT FOR CAMPUSES</p>
          <p className="text-sm font-semibold">MARIVELES, BATAAN CAMPUS</p>
        </div>

        {/* DATE */}
        <p className="mb-6">Month 00, 2025</p>

        {/* COMPANY / HR DETAILS */}
        <div className="mb-6">
          <p className="font-semibold">{supervisor}</p>
          <p>{company.position}</p>
          <p>{company.name}</p>
          <p>{company.address}</p>
        </div>

        {/* GREETING */}
        <p className="mb-4">Dear {supervisor.split(" ")[0]};</p>
        <p className="italic mb-4">Warmest greetings.</p>

        {/* BODY */}
        <p className="mb-4">
          The Bachelor of Elementary Education (BEEd) program aims to provide
          pre-service teachers with hands-on experience and exposure to
          real-world teaching environments, equipping them with essential skills
          and competencies for their future profession. With this, we respectfully
          endorse our student-teachers enrolled in this program to undergo their
          On-the-Job Training/Internship for 40 hours per week for one semester
          in your institution through face-to-face modality. Throughout their
          internship, they are expected to demonstrate competencies aligned with
          the program’s learning outcomes, specifically:
        </p>

        {/* COMPETENCIES */}
        <ul className="list-disc ml-6 space-y-2 mb-6">
          <li>
            Manifest meaningful and comprehensive pedagogical content knowledge
            (PCK) in various subject areas to effectively facilitate learning.
          </li>
          <li>
            Utilize appropriate assessment and evaluation strategies to measure
            and enhance student learning outcomes.
          </li>
          <li>
            Demonstrate an in-depth understanding of learner diversity, applying
            differentiated instruction and inclusive teaching strategies.
          </li>
          <li>
            Exhibit strong communication skills, higher-order thinking abilities,
            and proficiency in using educational technology to enrich both teaching
            and learning experiences.
          </li>
          <li>
            Embody the qualities of a professional educator, displaying ethical
            behavior, leadership, and a commitment to lifelong learning.
          </li>
        </ul>

        {/* INTERN LIST */}
        <p className="mb-2">
          Below are the student-interns who wish to be assigned to your reputable institution:
        </p>

        <ul className="list-disc ml-6 mb-6">
          {students.map((stud, i) => (
            <li key={i}>{stud}</li>
          ))}
        </ul>

        {/* REPORTING DATE */}
        <p className="mb-4">
          The student-interns will report physically beginning{" "}
          <b>{startDate}</b>, from Monday to Friday, 8:00 a.m. to 5:00 p.m.
          Should you have any concerns, you may reach me at 09xxxxxxxxx or
          hgdayanan@pup.edu.ph.
        </p>

        <p className="mb-8">
          We are looking forward to your affirmative and prompt response regarding this matter.
        </p>

        {/* SIGNATURE */}
        <p className="italic mb-2">Very truly yours,</p>
        <p className="font-bold mb-1">Mr. HONEY BERT G. DAYANAN, MAEd</p>
        <p className="text-sm mb-8">OJT Adviser, BEEd</p>

        {/* NOTED BY */}
        <p className="font-semibold mb-4">Noted by:</p>

        <div className="space-y-6">
          <div>
            <p className="font-bold">Asst. Prof. BENJIE M. MANILA, EdD</p>
            <p className="text-sm">OJT Coordinator</p>
          </div>

          <div>
            <p className="font-bold">Assoc. Prof. RUBY JEAN S. MEDINA</p>
            <p className="text-sm">Head, Academic Program</p>
          </div>

          <div>
            <p className="font-bold">Dr. RUFO N. BUEZA</p>
            <p className="text-sm">Campus Director</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs mt-12">
          <p>PUP Mariveles, Bataan Campus, Brgy. Maligaya, Mariveles, Bataan</p>
          <p>Email: bataan@pup.edu.ph | Website: www.pup.edu.ph</p>
          <p className="italic">“THE COUNTRY’S 1st POLYTECHNICU”</p>
        </div>
      </div>
    );
  }
);

export default EndorsementLetter;
