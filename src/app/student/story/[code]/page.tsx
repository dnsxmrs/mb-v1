import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoadingLink from "@/components/LoadingLink";
import UnauthorizedRedirect from "@/components/UnauthorizedRedirect";
import StudentSessionWrapper from "@/components/StudentSessionWrapper";
// import StoryViewTracker from "@/components/StoryViewTracker";
import QuizButton from "@/components/QuizButton";
import { getStoryByCode } from "@/actions/code";
import { convertToEmbedUrl, isValidYouTubeUrl } from "@/utils/youtube";
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
    title: "Story | Magandang Buhay!",
    description: "View the story",
  };
}

export default async function StoryPage({
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

  // Get story from database using the code
  const storyResult = await getStoryByCode(code);

  if (!storyResult.success || !storyResult.data) {
    return (
      <div className="h-[85vh] flex flex-col items-center justify-center mx-4">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Story not found</h1>
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

  const { story } = storyResult.data;

  return (
    <StudentSessionWrapper>
      {/* Track story view non-blocking */}
      {/* <StoryViewTracker code={code} /> */}

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full overflow-hidden">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2 break-words">{story.title}</h1>
              <p className="text-gray-500 text-sm mb-2 italic">ni {story.author}</p>
              {story.description && (
                <p className="text-gray-600 mt-2 break-words text-justify whitespace-pre-line">{story.description}</p>
              )}
            </div>

            {/* Story Content - You can display the file link or embed content here */}
            <div className="prose prose-lg max-w-none">
              {story.fileLink && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#1E3A8A] mb-3">Story Content:</h2>
                  {/* Check if it's a video/YouTube link */}
                  {isValidYouTubeUrl(story.fileLink) ? (
                    <div className="aspect-video w-full max-w-full">
                      <iframe
                        src={convertToEmbedUrl(story.fileLink)}
                        title={story.title}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <a
                      href={story.fileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition break-all"
                    >
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open Story File
                    </a>
                  )}
                </div>
              )}

              {/* Subtitles if available */}
              {story.subtitles && story.subtitles.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#1E3A8A] mb-3">Story Subtitles:</h2>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-hidden">
                    {story.subtitles.map((subtitle, index) => (
                      <p key={index} className="mb-2 text-gray-700 break-words">
                        {subtitle}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Button - Conditional based on completion status */}
            {story.QuizItems && story.QuizItems.length > 0 && (
              <QuizButton
                code={code}
                studentName={name}
                studentSection={section}
              />
            )}
          </div>
        </div>
      </div>
    </StudentSessionWrapper>
  );
}