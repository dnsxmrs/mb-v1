import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoadingLink from "@/components/LoadingLink";
// import UnauthorizedRedirect from "@/components/UnauthorizedRedirect";
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
    const storyMetadata = await getStoryByCode(code);

    if (storyMetadata.success && storyMetadata.data) {
      const { story } = storyMetadata.data;
      return {
        title: `${story.title} | E-KWENTO`,
        description: story.description || `Read the story "${story.title}" by ${story.author}`,
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Fallback metadata if story is not found
  return {
    title: "Quiz | E-KWENTO",
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

  const { name, section, deviceId } = JSON.parse(studentInfo.value);

  // Helper function to render error state
  const renderError = (title: string, message: string) => (
    <div className="h-[85vh] flex flex-col items-center justify-center mx-4">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-2">{title}</h1>
      <p className="text-gray-500 mb-6 text-center">{message}</p>
      <LoadingLink
        href="/"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
      >
        Bumalik sa Home
      </LoadingLink>
    </div>
  );

  // STEP 1: Get story data and check if it exists
  const storyResult = await getStoryByCode(code);
  if (!storyResult.success || !storyResult.data) {
    return renderError(
      "Hindi mahanap ang pagsusulit",
      storyResult.error || "Paumanhin, ang pagsusulit na hinahanap mo ay hindi umiiral o ang code ay hindi wasto."
    );
  }

  const { story, isActive, codeId } = storyResult.data;

  // STEP 2: Check if student has viewed this story before
  const viewedResult = await hasStudentViewedStory(code, name, section, deviceId);
  const hasViewed = viewedResult.success && viewedResult.data?.hasViewed;

  // STEP 3: Apply access control logic
  // If student hasn't viewed the story, they can only access if code is active
  // If student has viewed the story, they can access regardless of code status (library access)
  if (!hasViewed || !isActive) {
    return renderError(
      "Hindi available ang pagsusulit",
      "Ang pagsusulit na ito ay kasalukuyang hindi available. Mangyaring kumonsulta sa iyong guro."
    );
  }

  // Check if student has already taken the quiz on this device
  const quizStatusResult = await hasStudentTakenQuiz(code, name, section, deviceId || '');

  if (quizStatusResult.success && quizStatusResult.data?.hasTaken) {
    // Student has already taken the quiz, redirect to results page
    redirect(`/student/quiz/${code}/results`);
  }

  return (
    <StudentSessionWrapper>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full overflow-hidden">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1E3A8A] break-words">{story.title}</h1>
              <p className="text-gray-500 text-sm mb-2 italic">ni {story.author}</p>
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
                studentDeviceId={deviceId || ''}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Walang available na tanong para sa pagsusulit na ito.</p>
                <LoadingLink
                  href={`/student/story/${code}`}
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Bumalik sa Kwento
                </LoadingLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentSessionWrapper>
  );
}