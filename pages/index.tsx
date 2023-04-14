import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [job_description, setjob_description] = useState("");
  const [resume, setresume] = useState("");
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const [candidateAssesment, setcandidateAssesment] = useState<String>("");

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const prompt =  `Generate Job assessment, requirements:
  I will provide the job description and the candidate CV, and you will generate the assessment.
  1. check if candidate has the required skills, experience or potential and education
  2. Generate match score and match percentage, provide PROS and CONS, provide insights.
  Job Description:
  ${job_description}
  Candidate CV:
  ${resume}
  Query:`;

  const handleAssessment = async (e: any) => {
    e.preventDefault();
    setcandidateAssesment("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setcandidateAssesment((prev) => prev + chunkValue);
    }
    scrollToBios();
    setLoading(false);
  };


  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>CV Assessment GPT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <a
          className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100 mb-5"
          href="https://github.com/wey-gu/cv-assess-gpt"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
          <p>Star on GitHub</p>
        </a>
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Assess Candidate towards JD
        </h1>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Copy your Job Description{" "}
              <span className="text-slate-500">
                (or describe what the role is about in 1-2 sentences)
              </span>
              .
            </p>
          </div>
          <textarea
            value={job_description}
            onChange={(e) => setjob_description(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. We are looking for a Graph Database core developer to join our team. You will be responsible for developing and maintaining our Graph Database."
            }
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />

            <p className="text-left font-medium">Paste the Resume or CV of the candidate.</p>
          </div>
          <textarea
            value={resume}
            onChange={(e) => setresume(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. Name: John Doe\nEmail: foo@bar.com\nPhone: 1234567890\n\nEducation:\n\nWork Experience:\n\nSkills:\n\nProjects:\n\n..."
            }
          />

        </div>

        {!loading && (
          <button
            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
            onClick={handleAssessment}
          >
            Assess the candidate &rarr;
          </button>
        )}
        {loading && (
          <button
            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
            disabled
          >
            <LoadingDots color="white" style="large" />
          </button>
        )}
      </main>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
      <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
      <div className="space-y-10 my-10">
        {candidateAssesment && (
          <>
            <div>
              <h2
                className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                ref={bioRef}
              >
                Pros, Cons and Insights of the candidate
              </h2>
            </div>
            <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
              {candidateAssesment}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
