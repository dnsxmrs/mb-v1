import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoadingLink from "@/components/LoadingLink";
import UnauthorizedRedirect from "@/components/UnauthorizedRedirect";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import StudentSessionWrapper from "@/components/StudentSessionWrapper";
import { getStoryByCode } from "@/actions/code";
import { hasStudentTakenQuiz } from "@/actions/quiz";
import { Metadata } from "next";
import { hasStudentViewedStory } from "@/actions/story-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params;

  try {
    const storyResult = await getStoryByCode(code);

    if (storyResult.success && storyResult.data) {
      const { story } = storyResult.data;
      return {
        title: `${story.title} | Magandang Buhay!`,
        description: story.description || `Read the story "${story.title}" by ${story.author}`,
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Fallback metadata if story is not found
  return {
    title: "Quiz | Magandang Buhay!",
    description: "Take the quiz",
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params;

  // Check if user has given consent and provided info
  const cookieStore = await cookies();
  const hasConsent = cookieStore.get("privacy_consent");
  const studentInfo = cookieStore.get("student_info");

  if (!hasConsent || !studentInfo) {
    redirect("/student/info?code=" + code);
  }

  const { name, section } = JSON.parse(studentInfo.value);

  // check in studentstoryview if code, fullname, section already exists
  const authorized = await hasStudentViewedStory(code, name, section)

  if (authorized.data?.hasViewed === false) {
    return <UnauthorizedRedirect authorizedCode={code} />;
  }

  // Check if student has already taken the quiz
  const quizStatusResult = await hasStudentTakenQuiz(code, name, section);

  if (quizStatusResult.success && quizStatusResult.data?.hasTaken) {
    // Student has already taken the quiz, redirect to results page
    redirect(`/student/quiz/${code}/results`);
  }

  // Get story from database using the code
  const storyResult = await getStoryByCode(code);

  if (!storyResult.success || !storyResult.data) {
    return (
      <div className="h-[85vh] flex flex-col items-center justify-center mx-4">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Quiz not found</h1>
        <p className="text-gray-500 mb-6 text-center">
          {storyResult.error || "Sorry, the story you are looking for does not exist or the code is invalid."}
        </p>
        <LoadingLink
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Go back home
        </LoadingLink>
      </div>
    );
  }

  const { story, codeId } = storyResult.data;

  return (
    <StudentSessionWrapper>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full overflow-hidden">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2 break-words">{story.title}</h1>
              <p className="text-gray-500 text-sm mb-2 italic">ni {story.author}</p>
              {/* {story.description && (
              <p className="text-gray-600 mt-2 break-words text-justify whitespace-pre-line">{story.description}</p>
            )} */}
            </div>

            {/* Quiz Questions */}
            {story.QuizItems && story.QuizItems.length > 0 ? (
              <InteractiveQuiz
                quizItems={story.QuizItems}
                code={code}
                codeId={codeId}
                storyId={story.id}
                studentName={name}
                studentSection={section}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No quiz questions available for this story.</p>
                <LoadingLink
                  href={`/student/story/${code}`}
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Back to Story
                </LoadingLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentSessionWrapper>
  );
}